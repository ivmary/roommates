import { IUser, UserDocument } from '../../models/interfaces';
import { UserModel } from '../../models/User';
import { EntityId } from '../interfaces/IBaseRepository';
import { IUserRepository } from '../interfaces/IUserRepository';
import { MongoBaseRepository } from './MongoBaseRepository';

export class MongoUserRepository
  extends MongoBaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.model.findOne({ googleId }).exec();
  }

  findByIdWithoutPassword(id: EntityId): Promise<UserDocument | null> {
    return this.model.findById(id).select('-password').exec();
  }
}
