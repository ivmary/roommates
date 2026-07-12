import { Router } from 'express';
import { CityController } from '../controllers/CityController';

export function createCityRoutes(controller: CityController): Router {
  const router = Router();

  router.get('/', controller.getCities);

  return router;
}
