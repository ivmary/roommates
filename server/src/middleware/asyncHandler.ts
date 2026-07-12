import { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/** Route Express 4 async-handler rejections to the central errorHandler. */
export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
