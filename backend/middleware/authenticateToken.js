require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken');
const User = require('../models/User');
const app = express();

app.use(cookieParser()); // Use cookie-parser to extract tokens from cookies

/**
 * Middleware to authenticate users using JWT stored in cookies.
 *
 * This middleware handles the following:
 * - Extracts the JWT (access token) from the `access_token` cookie in the incoming request.
 * - Verifies the token using the secret stored in the environment variable `ACCESS_TOKEN_SECRET`.
 * - If the token is valid, the user's ID and role are extracted from the decoded payload and attached to `req.user`.
 * - If the token is missing or expired, it attempts to refresh the access token using a valid refresh token stored in the `refresh_token` cookie.
 * - If both the access token and refresh token are invalid or missing, the request is denied with appropriate HTTP status codes.
 *
 * Usage:
 * - Attach this middleware to routes that require authentication.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = async (req, res, next) => {
  // Retrieve the access token from the cookies
  let accessToken = req.cookies.access_token;
 
  if (!accessToken) {
 
    return handleRefreshToken(req, res, next);
  }

  // Decode the token without verifying to check for expiry
  const decoded = jwt.decode(accessToken);
  if (decoded && decoded.exp < Date.now() / 1000) {
    console.log('Access token is expired. Checking for refresh token.');
    return handleRefreshToken(req, res, next);
  }

  try {
   
    // Verify and decode the access token
    const verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  

    // Attach the user ID and role to the request object for further use
    req.user = { id: verified.id, role: verified.role };
    return next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying access token:', error.message);
    return handleRefreshToken(req, res, next);
  }
};

/**
 * Function to handle the refresh token logic.
 *
 * This function checks for the validity of the refresh token, and if valid,
 * generates a new access token and attaches it to the response cookies.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refresh_token;
  console.log('Received refresh token');

  if (!refreshToken) {
    console.log('No refresh token found.');
    return res.status(401).send('Refresh token required');
  }

  try {
    // Check if the refresh token is valid and not expired
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      console.log('Refresh token not found in the database.');
      return res.status(403).send('Invalid or expired refresh token');
    }

    if (storedToken.expiresAt < Date.now()) {
      console.log('Refresh token is expired.');
      return res.status(403).send('Invalid or expired refresh token');
    }

    console.log('Refresh token is valid. Looking up user...');
    const user = await User.findById(storedToken.userId);

    if (!user) {
      console.log('User associated with the refresh token not found.');
      return res.status(404).send('User not found');
    }

    console.log('Generating a new access token...');
    const payload = { id: user._id, role: user.role };
    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    console.log('New access token generated successfully.');

    // Set the new access token in the response cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the token
      secure: process.env.NODE_ENV === 'production', // Only secure in production, false during development.
      sameSite: 'Strict', // Mitigates CSRF attacks
      maxAge: 3600000, // 1 hour
    });

    req.user = { id: user._id, role: user.role };
    console.log('User authenticated with new access token:', req.user);

    return next(); // Proceed to the next middleware or route handler with the refreshed token
  } catch (refreshError) {
    console.error('Error during token refresh:', refreshError.message);
    return res.status(403).send('Invalid Token');
  }
};

module.exports = authenticateToken;
