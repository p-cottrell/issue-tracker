require('dotenv').config();
const jwt = require('jsonwebtoken');
// function to utalise authentication JSON web token

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorised' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userID = decoded.id.id ? decoded.id.id : decoded.id;
    const isAdministrator = decoded.isAdministrator;
  

    req.user = { userID, isAdministrator };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
}

module.exports = authenticateToken;