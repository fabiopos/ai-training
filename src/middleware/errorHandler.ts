import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from './httpError';

type ErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ErrorBody = {
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join('; ') || 'Invalid request';
    const body: ErrorBody = {
      error: { code: 'BAD_REQUEST', message },
    };
    res.status(400).json(body);
    return;
  }

  console.error(err);
  const body: ErrorBody = {
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
  };
  res.status(500).json(body);
};
