import { HttpError } from '../errors/HttpError';
import {
  ConversationDocument,
  MessageDocument,
} from '../models/interfaces';
import { EntityId } from '../repositories/interfaces/IBaseRepository';
import { IApartmentRepository } from '../repositories/interfaces/IApartmentRepository';
import { IConversationRepository } from '../repositories/interfaces/IConversationRepository';
import { IMessageRepository } from '../repositories/interfaces/IMessageRepository';

export interface SendMessageInput {
  conversationId?: string;
  apartmentId?: string;
  text?: string;
}

export interface SendMessageResult {
  conversation: ConversationDocument;
  message: MessageDocument;
  /** True when the conversation was created by this message (populated for emitting). */
  isNewConversation: boolean;
  /** True when the conversation was resolved from an apartment id (sender must join its room). */
  resolvedViaApartment: boolean;
  /** The listing owner's user id — set only for a new conversation. */
  ownerId?: string;
}

export class ChatService {
  constructor(
    private readonly conversations: IConversationRepository,
    private readonly messages: IMessageRepository,
    private readonly apartments: IApartmentRepository,
  ) {}

  getConversations(userId: EntityId): Promise<ConversationDocument[]> {
    return this.conversations.findByParticipant(userId);
  }

  async getMessages(userId: EntityId, conversationId: EntityId): Promise<MessageDocument[]> {
    const conversation = await this.conversations.findByIdAndParticipant(
      conversationId,
      userId,
    );
    if (!conversation) throw new HttpError(404, 'Conversation not found');

    return this.messages.findByConversation(conversation._id);
  }

  getConversationIds(userId: EntityId): Promise<ConversationDocument[]> {
    return this.conversations.findIdsByParticipant(userId);
  }

  async isParticipant(userId: EntityId, conversationId: EntityId): Promise<boolean> {
    const conversation = await this.conversations.findByIdAndParticipant(
      conversationId,
      userId,
    );
    return conversation !== null;
  }

  private async resolveConversation(
    userId: EntityId,
    { conversationId, apartmentId }: SendMessageInput,
  ): Promise<{
    conversation: ConversationDocument;
    isNewConversation: boolean;
    resolvedViaApartment: boolean;
    ownerId?: string;
  }> {
    if (conversationId) {
      const conversation = await this.conversations.findByIdAndParticipant(
        conversationId,
        userId,
      );
      if (!conversation) throw new HttpError(404, 'Conversation not found');
      return { conversation, isNewConversation: false, resolvedViaApartment: false };
    }

    const apartment = await this.apartments.findById(apartmentId as string);
    if (!apartment) throw new HttpError(404, 'Listing not found');
    if (apartment.owner.toString() === userId.toString()) {
      throw new HttpError(400, 'Cannot start a conversation with yourself');
    }

    const existing = await this.conversations.findByApartmentAndUsers(
      apartment._id,
      [apartment.owner, userId],
    );
    if (existing) {
      return { conversation: existing, isNewConversation: false, resolvedViaApartment: true };
    }

    const conversation = await this.conversations.create({
      apartment: apartment._id,
      participants: [apartment.owner, userId],
    } as Partial<ConversationDocument>);
    await this.conversations.populateForClient(conversation);

    return {
      conversation,
      isNewConversation: true,
      resolvedViaApartment: true,
      ownerId: apartment.owner.toString(),
    };
  }

  /**
   * Find-or-create the conversation, then store the message.
   * Room joins and event emission stay in the ChatGateway.
   */
  async sendMessage(userId: EntityId, input: SendMessageInput): Promise<SendMessageResult> {
    const { conversationId, apartmentId, text } = input;
    if (!text?.trim() || (!conversationId && !apartmentId)) {
      throw new HttpError(400, 'Invalid message');
    }

    const resolved = await this.resolveConversation(userId, input);

    const message = await this.messages.createWithSender({
      conversation: resolved.conversation._id,
      sender: userId,
      text: text.trim(),
    } as Partial<MessageDocument>);

    return { ...resolved, message };
  }
}
