import { ApartmentDocument, IApartment } from '../../models/interfaces';
import { EntityId, IBaseRepository } from './IBaseRepository';

export interface IApartmentRepository extends IBaseRepository<IApartment> {
  /** All listings, newest first, with owner name/avatar populated. */
  findAllWithOwner(): Promise<ApartmentDocument[]>;
  /** Listings of one owner, newest first, with owner name/avatar populated. */
  findByOwner(ownerId: EntityId): Promise<ApartmentDocument[]>;
  /** Single listing with owner name/avatar populated. */
  findByIdWithOwner(id: EntityId): Promise<ApartmentDocument | null>;
}
