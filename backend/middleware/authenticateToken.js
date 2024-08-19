/**
 * Middleware to authenticate users using JWT stored in cookies.
 *
 * This function extracts the JWT from the `access_token` cookie in the incoming request.
 * It then verifies the token using the secret stored in the environment variable `ACCESS_TOKEN_SECRET`.
 * If the token is valid, the user's ID is extracted from the decoded payload and attached to `req.user.userID`.
 * If the token is missing or invalid, the request is denied with appropriate HTTP status codes (401 for missing token, 403 for invalid token).
 *
 * Usage:
 * - Attach this middleware to routes that require authentication.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @throws {401} Access Denied if no token is provided.
 * @throws {403} Invalid Token if the provided token is invalid or expired.
 */

require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken')
const app = express();

app.use(cookieParser()); // Use cookie-parser to extract access token from cookie

const authenticateToken = (req, res, next) => {

  const token = req.cookies.access_token;

  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');

    req.user = { userID: user.id };
    next();
  });
};

module.exports = authenticateToken;