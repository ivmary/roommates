const express = require('express');
const router = express.Router();
const { getConversations, getMessages } = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getConversations);
router.get('/:id/messages', protect, getMessages);

module.exports = router;
