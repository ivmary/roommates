import { HydratedDocument, Types } from 'mongoose';
import { GenderPreference } from './enums';

export interface IUser {
  name: string;
  email: string;
  password: string | null;
  googleId: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApartment {
  title: string;
  description?: string;
  city: string;
  street?: string;
  price: number;
  rooms?: string;
  available?: string;
  gender?: GenderPreference;
  pets: boolean;
  smoking: boolean;
  students: boolean;
  furnished: boolean;
  images: string[];
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  apartment: Types.ObjectId;
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;
export type ApartmentDocument = HydratedDocument<IApartment>;
export type ConversationDocument = HydratedDocument<IConversation>;
export type MessageDocument = HydratedDocument<IMessage>;
