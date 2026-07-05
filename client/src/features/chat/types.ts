export interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
}

export interface ConversationApartment {
  _id: string;
  title: string;
  images: string[];
}

export interface Conversation {
  _id: string;
  apartment: ConversationApartment;
  participants: ChatUser[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: ChatUser;
  text: string;
  createdAt: string;
}
