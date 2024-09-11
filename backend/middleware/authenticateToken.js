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
 *
 * @throws {401} Access Denied if no access token is provided or if no refresh token is available for an expired token.
 * @throws {403} Invalid Token if the provided access token is invalid or expired and the refresh token is also invalid or expired.
 * @throws {404} User Not Found if the user associated with the refresh token does not exist.
 */

require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken');
const User = require('../models/User');
const app = express();

app.use(cookieParser()); // Use cookie-parser to extract tokens from cookies

const authenticateToken = async (req, res, next) => {
  // Retrieve the access token from the cookies
  const accessToken = req.cookies.access_token;

  try {
    if (accessToken) {
      // Verify and decode the access token using the secret key
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      // Attach the user ID and role to the request object
      req.user = { id: decoded.id, role: decoded.role };
      return next(); // Proceed to the next middleware or route handler
    }
  } catch (error) {
    // Handle the case where the access token is missing or expired
    if (error.name === 'TokenExpiredError' || !accessToken) {
      console.log("Access token expired or missing. Attempting to refresh.");

      // Extract the refresh token from the cookies
      const refreshToken = req.cookies.refresh_token;

      // If no refresh token is found, return a 401 (Unauthorized) response
      if (!refreshToken) {
        return res.status(401).send('Refresh token required');
      }

      try {
        // Check if the refresh token is valid and not expired
        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if (!storedToken || storedToken.expiresAt < Date.now()) {
          return res.status(403).send('Invalid or expired refresh token');
        }

        // Find the user associated with the refresh token
        const user = await User.findById(storedToken.userId);

        if (!user) {
          return res.status(404).send('User not found');
        }

        // Generate a new access token using the user's ID and role
        const payload = {
          id: user._id,
          role: user.role,
        };
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // Set the new access token in the response cookies
        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 3600000, // 1 hour
        });

        // Attach the user ID and role to the request object
        req.user = { id: user._id, role: user.role };

        return next(); // Proceed with the refreshed token
      } catch (refreshError) {
        console.error('Error during token refresh:', refreshError);
        return res.status(403).send('Invalid Token');
      }
    } else {
      // If the token is invalid for any other reason, return a 403 (Forbidden) response
      return res.status(403).send('Invalid Token');
    }
  }
};

module.exports = authenticateToken;