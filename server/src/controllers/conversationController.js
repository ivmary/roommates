const Apartment = require('../models/Apartment');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const createConversation = async (req, res) => {
  const { apartmentId } = req.body;
  const apartment = await Apartment.findById(apartmentId);
  if (!apartment) {
    return res.status(404).json({ message: 'Listing not found' });
  }
  if (apartment.owner.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json({ message: 'Cannot start a conversation with yourself' });
  }

  let conversation = await Conversation.findOne({
    apartment: apartmentId,
    participants: { $all: [apartment.owner, req.user._id] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      apartment: apartmentId,
      participants: [apartment.owner, req.user._id],
    });
  }

  res.status(201).json(conversation);
};

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

module.exports = { createConversation, getConversations, getMessages };
