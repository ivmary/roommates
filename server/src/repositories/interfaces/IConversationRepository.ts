import { ConversationDocument, IConversation } from '../../models/interfaces';
import { EntityId, IBaseRepository } from './IBaseRepository';

export interface IConversationRepository extends IBaseRepository<IConversation> {
  /** Conversations of a user, most recently updated first, with apartment and participants populated. */
  findByParticipant(userId: EntityId): Promise<ConversationDocument[]>;
  /** Conversation ids of a user (no population). */
  findIdsByParticipant(userId: EntityId): Promise<ConversationDocument[]>;
  /** A conversation only if the user participates in it. */
  findByIdAndParticipant(id: EntityId, userId: EntityId): Promise<ConversationDocument | null>;
  /** The conversation for an apartment that includes all given users. */
  findByApartmentAndUsers(apartmentId: EntityId, userIds: EntityId[]): Promise<ConversationDocument | null>;
  /** Populate apartment title/images and participants name/avatar on a document. */
  populateForClient(conversation: ConversationDocument): Promise<ConversationDocument>;
}
