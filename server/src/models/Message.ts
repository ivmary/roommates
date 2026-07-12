import mongoose from 'mongoose';
import { IMessage } from './interfaces';

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema);
