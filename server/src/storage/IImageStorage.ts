export interface IImageStorage {
  /** Absolute path of the base uploads directory (served at /uploads). */
  readonly uploadsDir: string;
  /** Create the base uploads directory if it does not exist. */
  ensureBaseDir(): void;
  /** Public URL for a stored image: /uploads/<apartmentId>/<filename>. */
  urlFor(apartmentId: string, filename: string): string;
  /** Delete a single image file given its public URL (fire-and-forget). */
  deleteImage(imageUrl: string): void;
  /** Delete an apartment's whole upload folder (fire-and-forget). */
  deleteApartmentFolder(apartmentId: string): void;
  /** Remove files of a failed upload and, for a create, its empty folder. */
  cleanupPartialUpload(filePaths: string[], apartmentId?: string): void;
}
