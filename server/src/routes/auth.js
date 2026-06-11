const express = require('express');
const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => res.json({ message: 'register' }));

// POST /api/auth/login
router.post('/login', (req, res) => res.json({ message: 'login' }));

module.exports = router;
