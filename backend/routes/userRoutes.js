const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
// SIgnup and sign in operations for users

router.post('signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = new User({ email, password: hashedPassword });
  user.save;
  res.status(201).send({ message: 'User created)' });
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