import { RequestHandler, Router } from 'express';
import { ConversationController } from '../controllers/ConversationController';

export function createConversationRoutes(
  controller: ConversationController,
  protect: RequestHandler,
): Router {
  const router = Router();

  router.get('/', protect, controller.getConversations);
  router.get('/:id/messages', protect, controller.getMessages);

  return router;
}
