const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('apartment', 'title images')
    .populate('participants', 'name avatar')
    .sort({ updatedAt: -1 });

  res.json(conversations);
};

const getMessages = async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
  });
  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 });

  res.json(messages);
};

module.exports = { getConversations, getMessages };
