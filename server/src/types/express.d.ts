import { Types } from 'mongoose';
import { UserDocument } from '../models/interfaces';

declare global {
  namespace Express {
    interface Request {
      /** Set by the auth middleware. */
      user?: UserDocument | null;
      /** Pre-generated listing id for create-with-images (see attachApartmentId). */
      apartmentId?: Types.ObjectId;
      /** Absolute paths of files written by Multer, for cleanup on upload failure. */
      _uploadedPaths?: string[];
    }
  }
}

export {};
