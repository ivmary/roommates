import { IMessage, MessageDocument } from '../../models/interfaces';
import { MessageModel } from '../../models/Message';
import { EntityId } from '../interfaces/IBaseRepository';
import { IMessageRepository } from '../interfaces/IMessageRepository';
import { MongoBaseRepository } from './MongoBaseRepository';

export class MongoMessageRepository
  extends MongoBaseRepository<IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  findByConversation(conversationId: EntityId): Promise<MessageDocument[]> {
    return this.model
      .find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async createWithSender(data: Partial<IMessage>): Promise<MessageDocument> {
    const message = await this.create(data);
    await message.populate('sender', 'name avatar');
    return message;
  }
}
