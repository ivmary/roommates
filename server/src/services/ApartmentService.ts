import { HttpError } from '../errors/HttpError';
import { ApartmentDocument, IApartment } from '../models/interfaces';
import { EntityId } from '../repositories/interfaces/IBaseRepository';
import { IApartmentRepository } from '../repositories/interfaces/IApartmentRepository';
import { IImageStorage } from '../storage/IImageStorage';

const BOOL_FIELDS = ['pets', 'smoking', 'students', 'furnished'] as const;
const MAX_IMAGES = 5;

/** Multipart form fields arrive as strings; shape of req.body. */
export type ApartmentBody = Record<string, unknown>;
/** The part of a Multer file the service needs. */
export interface UploadedFile {
  filename: string;
}

export class ApartmentService {
  constructor(
    private readonly apartments: IApartmentRepository,
    private readonly images: IImageStorage,
  ) {}

  /** Multipart type normalization: numeric price, real booleans. */
  private normalizeBody(body: ApartmentBody): ApartmentBody {
    const out = { ...body };
    if (out.price !== undefined) out.price = Number(out.price);
    for (const f of BOOL_FIELDS) {
      if (out[f] !== undefined) out[f] = out[f] === true || out[f] === 'true';
    }
    return out;
  }

  private validateRequired(body: ApartmentBody): void {
    const { title, city, price } = body;
    if (!title || !city || !price) {
      throw new HttpError(400, 'title, city and price are required');
    }
  }

  getAll(): Promise<ApartmentDocument[]> {
    return this.apartments.findAllWithOwner();
  }

  getByOwner(ownerId: EntityId): Promise<ApartmentDocument[]> {
    return this.apartments.findByOwner(ownerId);
  }

  async getById(id: EntityId): Promise<ApartmentDocument> {
    const apartment = await this.apartments.findByIdWithOwner(id);
    if (!apartment) throw new HttpError(404, 'Listing not found');
    return apartment;
  }

  private async findOwned(id: EntityId, userId: EntityId): Promise<ApartmentDocument> {
    const apartment = await this.apartments.findById(id);
    if (!apartment) throw new HttpError(404, 'Listing not found');
    if (apartment.owner.toString() !== userId.toString()) {
      throw new HttpError(403, 'Not authorized to modify this listing');
    }
    return apartment;
  }

  async create(
    ownerId: EntityId,
    apartmentId: EntityId,
    rawBody: ApartmentBody,
    files: UploadedFile[],
  ): Promise<ApartmentDocument> {
    const body = this.normalizeBody(rawBody);
    this.validateRequired(body);

    const images = files.map((f) =>
      this.images.urlFor(apartmentId.toString(), f.filename),
    );
    return this.apartments.create({
      ...body,
      _id: apartmentId,
      images,
      owner: ownerId,
    } as Partial<IApartment>);
  }

  async update(
    userId: EntityId,
    id: EntityId,
    rawBody: ApartmentBody,
    files: UploadedFile[],
  ): Promise<ApartmentDocument> {
    const apartment = await this.findOwned(id, userId);

    const body = this.normalizeBody(rawBody);
    this.validateRequired(body);

    let keptImages: string[];
    if (body.existingImages !== undefined) {
      try {
        keptImages = JSON.parse(body.existingImages as string);
        if (!Array.isArray(keptImages)) keptImages = [];
      } catch {
        keptImages = [];
      }
    } else {
      keptImages = apartment.images || [];
    }
    delete body.existingImages;

    const newImages = files.map((f) =>
      this.images.urlFor(apartment._id.toString(), f.filename),
    );
    const images = [...keptImages, ...newImages].slice(0, MAX_IMAGES);
    const removed = (apartment.images || []).filter(
      (img) => !images.includes(img),
    );

    const updated = await this.apartments.update(id, {
      ...body,
      images,
      owner: apartment.owner,
    } as Partial<IApartment>);

    removed.forEach((img) => this.images.deleteImage(img));

    return updated as ApartmentDocument;
  }

  async remove(userId: EntityId, id: EntityId): Promise<void> {
    const apartment = await this.findOwned(id, userId);
    await this.apartments.delete(apartment._id);
    this.images.deleteApartmentFolder(apartment._id.toString());
  }
}
