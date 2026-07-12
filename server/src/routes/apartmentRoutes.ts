import { RequestHandler, Router } from 'express';
import { Multer } from 'multer';
import { ApartmentController } from '../controllers/ApartmentController';
import { attachApartmentId } from '../middleware/upload';

export function createApartmentRoutes(
  controller: ApartmentController,
  protect: RequestHandler,
  upload: Multer,
): Router {
  const router = Router();

  router.get('/me', protect, controller.getMine);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', protect, attachApartmentId, upload.array('images', 5), controller.create);
  router.put('/:id', protect, upload.array('images', 5), controller.update);
  router.delete('/:id', protect, controller.remove);

  return router;
}
