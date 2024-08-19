require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

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

function validateEmail(email) {
  const emailChars = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailChars.test(email)) {
    throw new Error('Invalid email');
  }
}

async function isEmailTaken(email) {
  const user = await User.findOne({ email });
  return !!user;
}
//66b9f470f7954f3f1c49fce3
// SIgnup and sign in operations for users

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    validateEmail(email);
    validatePassword(password);

    if (await isEmailTaken(email)) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = new User({ username, email, password: hashedPassword });

    const newUser = await user.save();

    const payload = {
      id: newUser._id,
      isAdministrator: newUser.isAdministrator,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    // Send the token as the response
    return res
      .status(201)
      .json({
        accessToken,
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({
      success: false,
      message: 'Invalid login credentials'
    });
  }
  const payload = { id: user._id };

  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    userID: user._id,
  });
});


router.get('/all', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({error: 'Error fetching users', details: error.message});
  }
});






router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {

    if (!req.user.isAdministrator) {

      return res.status(403).send('You are not authorised to delete users');
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send('User deleted');
  } catch (error) {
    res.status(500).json({error: 'Error deleting user', details: error.message});
  }
});
module.exports = router;