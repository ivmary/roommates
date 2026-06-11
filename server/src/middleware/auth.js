const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized' });

  const token = header.split(' ')[1];

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = { protect };
