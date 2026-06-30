const express = require('express');
const router = express.Router();
const { createApartment, getApartments } = require('../controllers/apartmentController');
const { protect } = require('../middleware/auth');

router.get('/', getApartments);
router.post('/', protect, createApartment);
router.delete('/:id', protect, (req, res) => res.json({ message: 'close listing' }));

module.exports = router;
