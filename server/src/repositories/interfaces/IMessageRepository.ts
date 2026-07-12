import { IMessage, MessageDocument } from '../../models/interfaces';
import { EntityId, IBaseRepository } from './IBaseRepository';

export interface IMessageRepository extends IBaseRepository<IMessage> {
  /** Messages of a conversation, oldest first, with sender name/avatar populated. */
  findByConversation(conversationId: EntityId): Promise<MessageDocument[]>;
  /** Create a message and populate sender name/avatar. */
  createWithSender(data: Partial<IMessage>): Promise<MessageDocument>;
}
