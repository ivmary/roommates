import { IUser, UserDocument } from '../../models/interfaces';
import { EntityId, IBaseRepository } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<UserDocument | null>;
  findByGoogleId(googleId: string): Promise<UserDocument | null>;
  findByIdWithoutPassword(id: EntityId): Promise<UserDocument | null>;
}
