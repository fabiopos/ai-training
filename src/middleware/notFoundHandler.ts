import type { RequestHandler } from 'express';
import { HttpError } from './httpError';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'Resource not found', 'NOT_FOUND'));
};
