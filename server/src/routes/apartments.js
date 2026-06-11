const express = require('express');
const router = express.Router();

// GET /api/apartments
router.get('/', (req, res) => res.json({ message: 'list apartments' }));

// POST /api/apartments
router.post('/', (req, res) => res.json({ message: 'create apartment' }));

// DELETE /api/apartments/:id
router.delete('/:id', (req, res) => res.json({ message: 'close listing' }));

module.exports = router;
