require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
// SIgnup and sign in operations for users

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = new User({ username, email, password: hashedPassword });
  try {
    const newUser = await user.save();
    const payload = { id: newUser._id };
    console.log('payload', payload);
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

    res.send({ accessToken });
  } catch (error) {
    console.error('Error saving user:', error);
    res
      .status(500)
      .json({ error: 'Error saving user', details: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

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
  });
});
module.exports = router;