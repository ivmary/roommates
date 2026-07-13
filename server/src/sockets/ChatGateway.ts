import { Server, Socket } from 'socket.io';
import { HttpError } from '../errors/HttpError';
import { SocketEvent } from '../models/enums';
import { UserDocument } from '../models/interfaces';
import { AuthService } from '../services/AuthService';
import { ChatService, SendMessageInput } from '../services/ChatService';

type Ack = (response: { conversationId?: string; error?: string }) => void;

export class ChatGateway {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  attach(io: Server): void {
    io.use((socket, next) => {
      this.authenticate(socket, next);
    });
    io.on(SocketEvent.Connection, (socket) => {
      this.onConnection(io, socket);
    });
  }

  private async authenticate(socket: Socket, next: (err?: Error) => void): Promise<void> {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Not authorized'));

    try {
      const user = await this.authService.getUserFromToken(token);
      if (!user) return next(new Error('Not authorized'));
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Token invalid or expired'));
    }
  }

  private async onConnection(io: Server, socket: Socket): Promise<void> {
    const user = socket.data.user as UserDocument;

    // Personal room
    socket.join(user._id.toString());
    try {
      const myConversations = await this.chatService.getConversationIds(user._id);
      myConversations.forEach((c) => socket.join(c._id.toString()));
    } catch (err) {
      console.error('Failed to join conversation rooms:', err);
    }

    socket.on(SocketEvent.JoinConversation, async (conversationId: string) => {
      try {
        if (await this.chatService.isParticipant(user._id, conversationId)) {
          socket.join(conversationId);
        }
      } catch {
        /* invalid id — ignore, like the participant check */
      }
    });

    socket.on(
      SocketEvent.MessageSend,
      async (payload: SendMessageInput, callback?: unknown) => {
        const ack: Ack = typeof callback === 'function' ? (callback as Ack) : () => {};

        try {
          const { conversation, message, isNewConversation, resolvedViaApartment, ownerId } =
            await this.chatService.sendMessage(user._id, payload ?? {});

          const roomId = conversation._id.toString();
          if (resolvedViaApartment) socket.join(roomId);
          if (isNewConversation && ownerId) {
            io.in(ownerId).socketsJoin(roomId);
            io.to(ownerId).emit(SocketEvent.ConversationNew, conversation);
          }

          io.to(roomId).emit(SocketEvent.MessageNew, message);
          ack({ conversationId: roomId });
        } catch (err) {
          if (err instanceof HttpError) return ack({ error: err.message });
          console.error('message:send failed:', err);
          ack({ error: 'Internal server error' });
        }
      },
    );
  }
}
