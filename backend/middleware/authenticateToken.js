require('dotenv').config();
const jwt = require('jsonwebtoken');
// function to utalise authentication JSON web token

const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token; // Get the token from cookies
  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};


module.exports = authenticateToken;