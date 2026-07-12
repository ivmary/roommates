import { HydratedDocument, Model } from 'mongoose';
import { EntityId, IBaseRepository } from '../interfaces/IBaseRepository';

export class MongoBaseRepository<T> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  findById(id: EntityId): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id).exec();
  }

  findAll(): Promise<HydratedDocument<T>[]> {
    return this.model.find().exec();
  }

  create(data: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(data) as Promise<HydratedDocument<T>>;
  }

  update(id: EntityId, data: Partial<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: EntityId): Promise<boolean> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    return deleted !== null;
  }
}
