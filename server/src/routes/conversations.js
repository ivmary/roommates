const express = require('express');
const router = express.Router();
const {
  createConversation,
  getConversations,
  getMessages,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createConversation);
router.get('/', protect, getConversations);
router.get('/:id/messages', protect, getMessages);

module.exports = router;
