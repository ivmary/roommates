const express = require('express');
const router = express.Router();

// GET /api/messages/:apartmentId
router.get('/:apartmentId', (req, res) => res.json({ message: 'get messages' }));

// POST /api/messages/:apartmentId
router.post('/:apartmentId', (req, res) => res.json({ message: 'send message' }));

module.exports = router;
