import { asyncHandler } from '../middleware/asyncHandler';
import { CityService } from '../services/CityService';

export class CityController {
  constructor(private readonly cityService: CityService) {}

  getCities = asyncHandler(async (_req, res) => {
    try {
      res.json(await this.cityService.getCities());
    } catch (err) {
      console.error('Failed to fetch cities:', (err as Error).message);
      res.status(502).json({ error: 'Could not load cities' });
    }
  });
}
