import mongoose from 'mongoose';
import { IConversation } from './interfaces';

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
  },
  { timestamps: true }
);

conversationSchema.index({ apartment: 1, participants: 1 });

export const ConversationModel = mongoose.model<IConversation>('Conversation', conversationSchema);
