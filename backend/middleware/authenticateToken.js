const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.header['Authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try{
    const decoded = jwt.verify(token, 'key');
    req.userID = decoded.userID;
    next();

  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
} 
module.exports = authenticateToken;