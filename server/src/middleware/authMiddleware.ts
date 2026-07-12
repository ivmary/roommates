import { RequestHandler } from 'express';
import { AuthService } from '../services/AuthService';

export function createAuthMiddleware(authService: AuthService): RequestHandler {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authorized' });

    const token = header.split(' ')[1];

    try {
      req.user = await authService.getUserFromToken(token);
      next();
    } catch {
      res.status(401).json({ message: 'Token invalid or expired' });
    }
  };
}
