import { HydratedDocument, Types } from 'mongoose';

export type EntityId = string | Types.ObjectId;

export interface IBaseRepository<T> {
  findById(id: EntityId): Promise<HydratedDocument<T> | null>;
  findAll(): Promise<HydratedDocument<T>[]>;
  create(data: Partial<T>): Promise<HydratedDocument<T>>;
  update(id: EntityId, data: Partial<T>): Promise<HydratedDocument<T> | null>;
  delete(id: EntityId): Promise<boolean>;
}
