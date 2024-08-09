const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
// SIgnup and sign in operations for users

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Create a new user instance
    const user = new User({ email, password: hashedPassword });

    // Save the user to the database
    await user.save();

    // Respond to the client
    res.status(201).send({ message: 'User created' });

  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ message: 'Invalid login credentials' });
  }
  const token = jwt.sign({ userID: user }, 'key');
  res.send({ token });
});

module.exports = router;