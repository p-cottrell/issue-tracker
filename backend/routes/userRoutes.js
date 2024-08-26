/**
 * User  Management Routes
 *
 * This module defines routes for user registration and login.
 *
* IMPORTANT: AuthenticateToken authenticates using cookies so when calling the API on
 * the front-end you must use apiClient (api/apiClient) to ensure authentication cookies
 * are passed too
 *
 */

require('dotenv').config();
const express = require('express');
const User = require('../models/User');
const RefreshToken = require('../models/refreshToken');
const authenticateToken = require('../middleware/authenticateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const validateEmail = require("../utils/validateEmail");
const validatePassword = require("../utils/validatepassword");
const isEmailTaken = require("../utils/isEmailTaken");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


/**
 * Route to register a new user.
 *
 * This route handles user registration by validating the provided email and password,
 * hashing the password, and storing the new user's data in the database. A JWT token
 * is generated for the new user and sent as a cookie in the response.
 *
 * @name POST /users/register
 * @function
 * @memberof module:routes/users
 * @param {Object} req.body - The user data (username, email, password).
 * @param {Object} res - The response object.
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate the provided email address.
    validateEmail(email);

    // Check if the email is already taken.
    if (await isEmailTaken(email)) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    // Validate the password (commented out for testing purposes).
    // validatePassword(password);

    // Generate a salt for hashing the password.
    const salt = await bcrypt.genSalt(10);

    // Hash the provided password with the generated salt.
    const hashedPassword = await bcrypt.hashSync(password, salt);

    // Create a new user instance with the provided username, email, and hashed password.
    const user = new User({
      username,
      email,
      password_hash: hashedPassword,
    });

    // Save the new user to the database.
    const newUser = await user.save();

    // Create a payload for the JWT, including the user's ID and role.
    const payload = {
      id: newUser._id,
      role: newUser.role,
    };

    // Generate an access token with a 1-hour expiration time.
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    // Set a cookie with the access token.
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production, false during development.
      sameSite: 'Strict', // Ensures the cookie is only sent with same-site requests (mitigates CSRF attacks)
      maxAge: 3600000, // 1 hour
    });

    // Generate a refresh token for the user.
    const refreshToken = await generateRefreshToken(newUser._id);

    // Set a cookie with the refresh token.
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production, false during development.
      sameSite: 'Strict', // Ensures the cookie is only sent with same-site requests (mitigates CSRF attacks)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log(refreshToken) // DEBUG

    // Respond with the new user's ID and role.
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    // Log any errors that occur during the process and respond with a 500 status code.
    console.error('Error saving user:', error);
    return res.status(500).json({ error: 'Error saving user', details: error.message });
  }
});


/**
 * Route to log in an existing user.
 *
 * This route handles user login by verifying the provided email and password.
 * If successful, a JWT token is generated and sent as a cookie in the response.
 *
 * @name POST /users/login
 * @function
 * @memberof module:routes/users
 * @param {Object} req.body - The login credentials (email, password).
 * @param {Object} res - The response object.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Fetch the user from DB using provided email
  const user = await User.findOne({ email });

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.json({
      success: false,
      message: 'Invalid login credentials'
    });
  }

  // Prepare payload data for JWT generation
  const payload = {
    id: user._id,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'});

  // Set a secure cookie with the generated JWT for authentication purposes
  res.cookie('access_token', accessToken, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the token
    secure : process.env.NODE_ENV === 'production', // Only secure in production, false during development.
    sameSite: 'Strict', //mitigates CSRF attacks
    maxAge: 3600000, // 1 hour
  });

  // Check if an existing refresh token exists for the user
  let refreshToken = await RefreshToken.findOne({ userId: user._id });

  if (!refreshToken) {
    // If no valid refresh token exists, generate a new one
    refreshToken = await generateRefreshToken(user._id);
  }

  // Set a cookie with the refresh token.
  res.cookie('refresh_token', refreshToken.token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the token
    secure: process.env.NODE_ENV === 'production', // Only secure in production, false during development.
    sameSite: 'Strict', //mitigates CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: 'Login successful',
  });

});

/**
 * Route to log out a user.
 *
 * On logout the acces token and the refresh token are destroyed.
 *
 * @name POST /users/logout
 * @function
 * @memberof module:routes/users
 * @param {Object} req.cookies - The cookie containing the refresh token.
 * @param {Object} res - The response object.
 */
router.post('/logout', authenticateToken, async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).send('Logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).send('Error during logout');
  }
});


//
/**
 * Route to validate a user token
 *
 * This route is used to validate users so they can't access protected routes,
 * Used in protectedRoutes.js
 *
 * @name POST /users/check_token
 * @function
 * @memberof module:routes/users
 * @param {Object} res - The response object.
 */
router.get('/check_token', authenticateToken, (req, res) => {
  // If the request reaches here, it means the token is valid
  return res.status(200).json({ message: 'Token is valid' });
});

module.exports = router;



// Route to retrieve all users if are an admin dude
router.get('/all', async (req, res) => {
  try {
     if (req.user?.role !== 'admin') {
      return res.status(403).send('You are not authorised to view users');
    }

    const users = await User.find({});

    res.status(200).json(users);
  } catch (error) {

    res.status(500).json({
      error: 'Error fetching users',
      details: error.message,
    });
  }
});


// Route to delete a user by ID (Admin only)
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {

    if ((req.user?.role !== 'admin')) {
      return res.status(403).send('You are not authorised to delete users');
    }


    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }


    res.status(200).send('User deleted');
  } catch (error) {

    res.status(500).json({
      error: 'Error deleting user',
      details: error.message,
    });
  }
});



module.exports = router;