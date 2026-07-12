import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.post('/google', controller.google);

  return router;
}
