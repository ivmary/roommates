export enum GenderPreference {
  None = '',
  Mixed = 'Mixed',
  FemaleOnly = 'Female only',
  MaleOnly = 'Male only',
}

export enum SocketEvent {
  Connection = 'connection',
  JoinConversation = 'join:conversation',
  MessageSend = 'message:send',
  MessageNew = 'message:new',
  ConversationNew = 'conversation:new',
}
