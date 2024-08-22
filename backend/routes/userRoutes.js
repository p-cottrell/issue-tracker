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
const User = require('../Schemas/User');
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
  
    
      if (await isEmailTaken(email)) {
        return res.status(400).json({ error: 'Email already taken' });
      }
  
      //validatePassword(password); // Commented out for testing
      const salt = bcrypt.genSaltSync(10);
  
    
      const hashedPassword = bcrypt.hashSync(password, salt);
  
    
      const user = new User({
        username,
        email,
        password_hash: hashedPassword, 
      });
  
    
      const newUser = await user.save();
  
    
      const payload = {
        id: newUser._id,
        role: newUser.role, 
      };
  
     
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  
    
      res.cookie('access_token', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 3600000, 
      });
  
      
      return res.status(201).json({
        userID: newUser._id,
        role: newUser.role,
      });
    } catch (error) {
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
      secure: process.env.NODE_ENV === 'production',// this will be set in the .env file when we switch to production mode 
      message: 'Invalid login credentials'
    });
  }

  // Prepare payload data for JWT generation
  const payload = {
    id: user._id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {exiresIn: '1h'});

  // Set a secure cookie with the generated JWT for authentication purposes
  res.cookie('access_token', token, {
    httpOnly: true, 
    secure : process.env.NODE_ENV === 'production', 
    sameSite: 'Strict', 
    maxAge: 3600000, 
});


  res.json({
    success: true,
    message: 'Login successful',
  });
});

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