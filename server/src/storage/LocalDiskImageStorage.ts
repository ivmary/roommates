import fs from 'fs';
import path from 'path';
import { IImageStorage } from './IImageStorage';

export class LocalDiskImageStorage implements IImageStorage {
  readonly uploadsDir = path.join(__dirname, '../../uploads');

  ensureBaseDir(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  urlFor(apartmentId: string, filename: string): string {
    return `/uploads/${apartmentId}/${filename}`;
  }

  deleteImage(imageUrl: string): void {
    const filePath = path.join(this.uploadsDir, imageUrl.replace('/uploads/', ''));
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT')
        console.error('Failed to delete image file:', filePath, err);
    });
  }

  deleteApartmentFolder(apartmentId: string): void {
    fs.rm(
      path.join(this.uploadsDir, apartmentId),
      { recursive: true, force: true },
      (err) => {
        if (err)
          console.error(
            'Failed to delete apartment upload folder:',
            apartmentId,
            err,
          );
      },
    );
  }

  cleanupPartialUpload(filePaths: string[], apartmentId?: string): void {
    filePaths.forEach((p) => fs.unlink(p, () => {}));
    if (apartmentId) {
      fs.rmdir(path.join(this.uploadsDir, apartmentId), () => {});
    }
  }
}
