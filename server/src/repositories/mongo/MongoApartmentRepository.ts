import { ApartmentDocument, IApartment } from '../../models/interfaces';
import { ApartmentModel } from '../../models/Apartment';
import { EntityId } from '../interfaces/IBaseRepository';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';
import { MongoBaseRepository } from './MongoBaseRepository';

export class MongoApartmentRepository
  extends MongoBaseRepository<IApartment>
  implements IApartmentRepository
{
  constructor() {
    super(ApartmentModel);
  }

  findAllWithOwner(): Promise<ApartmentDocument[]> {
    return this.model
      .find()
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  findByOwner(ownerId: EntityId): Promise<ApartmentDocument[]> {
    return this.model
      .find({ owner: ownerId })
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  findByIdWithOwner(id: EntityId): Promise<ApartmentDocument | null> {
    return this.model.findById(id).populate('owner', 'name avatar').exec();
  }
}
