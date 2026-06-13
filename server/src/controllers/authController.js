const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ message: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  res.status(201).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
};

const googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential)
    return res.status(400).json({ message: 'Missing credential' });

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { sub, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ googleId: sub });
  if (!user) user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = sub;
      user.avatar = user.avatar || picture;
      await user.save();
    }
  } else {
    user = await User.create({ name, email, googleId: sub, avatar: picture });
  }

  res.json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
};

module.exports = { register, login, googleAuth };
