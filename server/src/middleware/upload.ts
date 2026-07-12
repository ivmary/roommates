import fs from 'fs';
import path from 'path';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import multer, { Multer } from 'multer';
import { HttpError } from '../errors/HttpError';
import { IImageStorage } from '../storage/IImageStorage';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** A rejected file type; triggers upload cleanup in the errorHandler. */
export class UploadError extends HttpError {
  constructor(message: string) {
    super(400, message);
    this.name = 'UploadError';
  }
}

/** Give a new listing its id up front so its images land in the right folder. */
export const attachApartmentId: RequestHandler = (req, res, next) => {
  req.apartmentId = new mongoose.Types.ObjectId();
  next();
};

export function createUploadMiddleware(imageStorage: IImageStorage): Multer {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const id = (req.apartmentId || req.params.id).toString();
      const dest = path.join(imageStorage.uploadsDir, id);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const name = `${unique}${path.extname(file.originalname)}`;
      req._uploadedPaths = req._uploadedPaths || [];
      req._uploadedPaths.push(
        path.join(
          imageStorage.uploadsDir,
          (req.apartmentId || req.params.id).toString(),
          name,
        ),
      );
      cb(null, name);
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new UploadError('Only JPEG, PNG and WEBP images are allowed'));
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  });
}
