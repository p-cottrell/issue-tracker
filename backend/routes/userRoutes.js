/**
 * User Authentication and Management Routes
 *
 * This module defines routes for user registration and login.
 *
 * IMPORTANT: AuthenticateToken authenticates using cookies so when calling the API on
 * the front-end you must use {withCredentials: true} to ensure authentication cookies
 * are passed too.
 *
 */

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

/**
 * Validate the strength of the user's password.
 *
 * This function checks if the provided password meets specific criteria:
 * - At least 8 characters long
 * - Contains at least 1 uppercase letter
 * - Contains at least 1 special character
 * - Contains at least 1 number
 * - Does not contain any spaces
 *
 * @param {string} password - The password to validate.
 * @throws Will throw an error if the password does not meet the criteria.
 */
function validatePassword(password) {
  const minLength = 8;
  const minUppercase = 1;
  const specialChars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  const uppercaseChars = /[A-Z]/;
  const numberChars = /[0-9]/;
  const spaces = /\s/;

  if (password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters`);
  }
  if (!specialChars.test(password)) {
    throw new Error('Password must contain at least one special character');
  }

  if (!uppercaseChars.test(password)) {
    throw new Error(
      `Password must contain at least ${minUppercase} uppercase character`
    );
  }
  if (!numberChars.test(password)) {
    throw new Error('Password must contain at least one number');
  }

  if (spaces.test(password)) {
    throw new Error('Password cannot contain spaces');
  }
}

/**
 * Validate the format of the user's email.
 *
 * This function checks if the provided email matches the expected email pattern.
 *
 * @param {string} email - The email to validate.
 * @throws Will throw an error if the email format is invalid.
 */
function validateEmail(email) {
  const emailChars = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailChars.test(email)) {
    throw new Error('Invalid email');
  }
}

/**
 * Check if an email is already associated with an existing user.
 *
 * This function queries the database to determine if a user with the given email already exists.
 *
 * @param {string} email - The email to check.
 * @returns {<boolean>} - Returns true if the email is taken, false otherwise.
 */
async function isEmailTaken(email) {
  const user = await User.findOne({ email });
  return !!user;
}

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
    validateEmail(email);
    // validatePassword(password);

    // Check if the provided email is already associated with an existing user
    if (await isEmailTaken(email)) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    // Hash the user's password for secure storage in the database
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Create a new user instance with the provided data
    const user = new User({ username, email, password: hashedPassword });

    // Save the new user to the database
    const newUser = await user.save();

    // Prepare payload data for JWT generation (includes user ID and admin status)
    const payload = {
      id: newUser._id,
      isAdministrator: newUser.isAdministrator,
    };
    // Generate a JWT token using the payload and the application's secret key
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

    // Set a secure cookie with the generated JWT, which will be used for subsequent authentication
    res.cookie('access_token', token, {
    httpOnly: true, // Ensures the cookie cannot be accessed via JavaScript
    secure:false, // This will only use `secure` in production (False here so we can use HTTP in development)
    sameSite: 'Strict', // Prevent CSRF
    maxAge: 3600000, // Cookie expiration time set to 1 hour (in milliseconds)
});

    // Respond with the newly created user's ID and admin status
    return res
      .status(201)
      .json({
        userID: newUser._id,
        isAdministrator: newUser.isAdministrator,
      });
  } catch (error) {
    console.error('Error saving user:', error);
    return res
      .status(500)
      .json({ error: 'Error saving user', details: error.message });
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

  // Validate the user
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({
      success: false,
      message: 'Invalid login credentials'
    });
  }

  // Prepare payload data for JWT generation
  const payload = {
    id: user._id
  };
  // Generate a JWT token using the payload and the application's secret key
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

  // Set a secure cookie with the generated JWT for authentication purposes
  res.cookie('access_token', token, {
    httpOnly: true, // Cannot be accessed via JavaScript
    secure:false, // Set to true in production to enforce HTTPS (false here for development)
    sameSite: 'Strict', // Prevent CSRF
    maxAge: 3600000, // Expires after 1 hour
});

  // Respond with a success message for front end use
  res.json({
    success: true,
    message: 'Login successful',
  });
});

// Route to retrieve all users
router.get('/all', async (req, res) => {
  try {
    // Fetch all user documents from the database
    const users = await User.find({});
    // Respond with the retrieved users
    res.status(200).json(users);
  } catch (error) {
    // Handle any errors that occur during user retrieval
    res.status(500).json({
      error: 'Error fetching users',
      details: error.message,
    });
  }
});


// Route to delete a user by ID (Admin only)
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    // Check if the requesting user is an administrator
    if (!req.user.isAdministrator) {
      return res.status(403).send('You are not authorised to delete users');
    }

    // Attempt to delete the user with the specified ID from the database
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Respond with a confirmation message if the user is successfully deleted
    res.status(200).send('User deleted');
  } catch (error) {
    // Handle any errors that occur during user deletion
    res.status(500).json({
      error: 'Error deleting user',
      details: error.message,
    });
  }
});

// Export the router to be used in other parts of the application
module.exports = router;