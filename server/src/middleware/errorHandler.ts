import { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { HttpError } from '../errors/HttpError';
import { IImageStorage } from '../storage/IImageStorage';
import { UploadError } from './upload';

/**
 * Central error mapping: upload errors clean up partially written files
 * and answer 400; HttpError from services keeps its status; anything
 * else is a 500.
 */
export function createErrorHandler(imageStorage: IImageStorage): ErrorRequestHandler {
  return (err, req, res, _next) => {
    if (err instanceof multer.MulterError || err instanceof UploadError) {
      imageStorage.cleanupPartialUpload(
        req._uploadedPaths || [],
        req.apartmentId?.toString(),
      );
      return res.status(400).json({ message: err.message });
    }

    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  };
}
