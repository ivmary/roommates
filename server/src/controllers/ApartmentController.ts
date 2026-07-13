/// <reference path="../types/express.d.ts" />
import { Request } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApartmentService } from '../services/ApartmentService';

const filesOf = (req: Request) => (req.files as Express.Multer.File[]) || [];

export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  create = asyncHandler(async (req, res) => {
    const apartment = await this.apartmentService.create(
      req.user!._id,
      req.apartmentId!,
      req.body,
      filesOf(req),
    );
    res.status(201).json(apartment);
  });

  getAll = asyncHandler(async (_req, res) => {
    res.json(await this.apartmentService.getAll());
  });

  getMine = asyncHandler(async (req, res) => {
    res.json(await this.apartmentService.getByOwner(req.user!._id));
  });

  getById = asyncHandler(async (req, res) => {
    res.json(await this.apartmentService.getById(req.params.id));
  });

  update = asyncHandler(async (req, res) => {
    const apartment = await this.apartmentService.update(
      req.user!._id,
      req.params.id,
      req.body,
      filesOf(req),
    );
    res.json(apartment);
  });

  remove = asyncHandler(async (req, res) => {
    await this.apartmentService.remove(req.user!._id, req.params.id);
    res.json({ message: 'Listing deleted' });
  });
}
