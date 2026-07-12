import { asyncHandler } from '../middleware/asyncHandler';
import { ChatService } from '../services/ChatService';

export class ConversationController {
  constructor(private readonly chatService: ChatService) {}

  getConversations = asyncHandler(async (req, res) => {
    res.json(await this.chatService.getConversations(req.user!._id));
  });

  getMessages = asyncHandler(async (req, res) => {
    res.json(await this.chatService.getMessages(req.user!._id, req.params.id));
  });
}
