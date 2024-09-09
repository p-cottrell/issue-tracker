/**
 * Middleware to authenticate users using JWT stored in cookies.
 *
 * This middleware handles the following:
 * - Extracts the JWT (access token) from the `access_token` cookie in the incoming request.
 * - Verifies the token using the secret stored in the environment variable `ACCESS_TOKEN_SECRET`.
 * - If the token is valid, the user's ID is extracted from the decoded payload and attached to `req.user.userID`.
 * - If the token is missing, expired, or invalid, the request is denied with appropriate HTTP status codes.
 * - If the token is expired, it attempts to refresh the access token using a valid refresh token stored in the `refresh_token` cookie.
 *
 * If the access token is expired but the refresh token is valid, a new access token is generated and stored in the `access_token` cookie,
 * allowing the request to proceed with the new token.
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
  let accessToken = req.cookies.access_token;

  try {
    if (accessToken) {
      // Verify and decode the access token using the secret key
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      // Attach the user ID to the request object for further use
      req.user = { id: decoded.id, isAdministrator: decoded.isAdministrator };
      return next(); // Proceed to the next middleware or route handler
    } else {
      throw new jwt.TokenExpiredError(); // Force the refresh token logic to be invoked
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError' || !accessToken) {
      console.log("Token Expired or Missing. Checking refresh token.");

      // Extract the refresh token from the cookies
      const refreshToken = req.cookies.refresh_token;

      // If no refresh token is found, return a 401 (Unauthorized) response
      if (!refreshToken) {
        console.log("No refresh token.");
        return res.status(401).send('Refresh token required');
      }

      // Check if the refresh token is valid and not expired
      const storedToken = await RefreshToken.findOne({ token: refreshToken });

      // If the refresh token is invalid or expired, return a 403 (Forbidden) response
      if (!storedToken || storedToken.expiresAt < Date.now()) {
        return res.status(403).send('Invalid or expired refresh token');
      }

      // Find the user associated with the refresh token
      const user = await User.findById(storedToken.userId);

      // If the user does not exist, return a 404 (Not Found) response
      if (!user) {
        return res.status(404).send('User not found');
      }

      // Generate a new access token using the user's ID and role
      const payload = {
        id: user._id,
        role: user.role,
      };
      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log("New Access Token generated:", newAccessToken);

      // Set the new access token in the response cookies
      res.cookie('access_token', newAccessToken, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the token
        secure: process.env.NODE_ENV === 'production', // Only secure in production, false during development.
        sameSite: 'Strict', // mitigates CSRF attacks
        maxAge: 3600000, // 1 hour
      });

      // Attach the user ID to the request object for further use in the request lifecycle
      req.user = { id: user._id, role: user.role }; // Consistent key

      return next(); // Proceed to the next middleware or route handler with the refreshed token
    } else {
      // If the token is invalid for any other reason, return a 403 (Forbidden) response
      return res.status(403).send('Invalid Token');
    }
  }
};


module.exports = authenticateToken;
