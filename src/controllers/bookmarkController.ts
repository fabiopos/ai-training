import type { RequestHandler } from 'express';
import type { SqliteDatabase } from '../db/sqliteTypes';
import { bookmarkIdSchema } from '../models/bookmark';
import { HttpError } from '../middleware/httpError';
import { findBookmarkById } from '../services/bookmarkService';

export function makeGetBookmarkById(db: SqliteDatabase): RequestHandler {
  return (req, res, next) => {
    try {
      const parsed = bookmarkIdSchema.safeParse(req.params.id);
      if (!parsed.success) {
        throw new HttpError(400, 'Invalid bookmark id', 'BAD_REQUEST');
      }

      const bookmark = findBookmarkById(db, parsed.data);
      if (!bookmark) {
        throw new HttpError(404, 'Bookmark not found', 'NOT_FOUND');
      }

      res.status(200).json(bookmark);
    } catch (err) {
      next(err);
    }
  };
}
