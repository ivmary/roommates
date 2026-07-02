const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '../../uploads');

function attachApartmentId(req, res, next) {
  req.apartmentId = new mongoose.Types.ObjectId();
  next();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = (req.apartmentId || req.params.id).toString();
    const dest = path.join(uploadsDir, id);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG and WEBP images are allowed'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

function handleUploadErrors(err, req, res, next) {
  if (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message || 'Upload failed' });
  }
  next();
}

module.exports = { upload, attachApartmentId, handleUploadErrors, uploadsDir };
