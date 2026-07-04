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
const { upload, attachApartmentId, handleUploadErrors } = require('../middleware/upload');

router.get('/me', protect, getMyApartments);
router.get('/', getApartments);
router.get('/:id', getApartmentById);
router.post('/', protect, attachApartmentId, upload.array('images', 5), handleUploadErrors, createApartment);
router.put('/:id', protect, upload.array('images', 5), handleUploadErrors, updateApartment);
router.delete('/:id', protect, deleteApartment);

module.exports = router;
