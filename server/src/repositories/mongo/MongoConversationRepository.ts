import { ConversationDocument, IConversation } from '../../models/interfaces';
import { ConversationModel } from '../../models/Conversation';
import { EntityId } from '../interfaces/IBaseRepository';
import { IConversationRepository } from '../interfaces/IConversationRepository';
import { MongoBaseRepository } from './MongoBaseRepository';

export class MongoConversationRepository
  extends MongoBaseRepository<IConversation>
  implements IConversationRepository
{
  constructor() {
    super(ConversationModel);
  }

  findByParticipant(userId: EntityId): Promise<ConversationDocument[]> {
    return this.model
      .find({ participants: userId })
      .populate('apartment', 'title images')
      .populate('participants', 'name avatar')
      .sort({ updatedAt: -1 })
      .exec();
  }

  findIdsByParticipant(userId: EntityId): Promise<ConversationDocument[]> {
    return this.model.find({ participants: userId }).select('_id').exec();
  }

  findByIdAndParticipant(id: EntityId, userId: EntityId): Promise<ConversationDocument | null> {
    return this.model.findOne({ _id: id, participants: userId }).exec();
  }

  findByApartmentAndUsers(
    apartmentId: EntityId,
    userIds: EntityId[]
  ): Promise<ConversationDocument | null> {
    return this.model
      .findOne({ apartment: apartmentId, participants: { $all: userIds } })
      .exec();
  }

  async populateForClient(conversation: ConversationDocument): Promise<ConversationDocument> {
    await conversation.populate('apartment', 'title images');
    await conversation.populate('participants', 'name avatar');
    return conversation;
  }
}
