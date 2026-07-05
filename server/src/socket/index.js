const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Not authorized'));

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select('-password');
    if (!user) return next(new Error('Not authorized'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Token invalid or expired'));
  }
};

function initSocket(io) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.on('join:conversation', async (conversationId) => {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id,
      });
      if (!conversation) return;

      socket.join(conversationId);
    });

    socket.on('message:send', async ({ conversationId, text }) => {
      if (!conversationId || !text?.trim()) return;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id,
      });
      if (!conversation) return;

      const message = await Message.create({
        conversation: conversationId,
        sender: socket.user._id,
        text: text.trim(),
      });
      await message.populate('sender', 'name avatar');

      io.to(conversationId).emit('message:new', message);
    });
  });
}

module.exports = initSocket;
