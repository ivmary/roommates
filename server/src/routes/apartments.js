const express = require('express');
const router = express.Router();
const {
  createApartment,
  getApartments,
  getMyApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
} = require('../controllers/apartmentController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMyApartments);
router.get('/', getApartments);
router.get('/:id', getApartmentById);
router.post('/', protect, createApartment);
router.put('/:id', protect, updateApartment);
router.delete('/:id', protect, deleteApartment);

module.exports = router;
