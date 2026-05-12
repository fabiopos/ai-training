import type { RequestHandler } from 'express';
import type { SqliteDatabase } from '../db/sqliteTypes';
import {
  bookmarkIdSchema,
  createBookmarkBodySchema,
  updateBookmarkBodySchema,
} from '../models/bookmark';
import { HttpError } from '../middleware/httpError';
import {
  createBookmark,
  deleteBookmark,
  findBookmarkById,
  updateBookmark,
} from '../services/bookmarkService';

export function makeCreateBookmark(db: SqliteDatabase): RequestHandler {
  return (req, res, next) => {
    try {
      const body = createBookmarkBodySchema.parse(req.body);
      const bookmark = createBookmark(db, body);
      res.status(201).json(bookmark);
    } catch (err) {
      next(err);
    }
  };
}

export function makeUpdateBookmark(db: SqliteDatabase): RequestHandler {
  return (req, res, next) => {
    try {
      const parsedId = bookmarkIdSchema.safeParse(req.params.id);
      if (!parsedId.success) {
        throw new HttpError(400, 'Invalid bookmark id', 'BAD_REQUEST');
      }

      const body = updateBookmarkBodySchema.parse(req.body);
      const bookmark = updateBookmark(db, parsedId.data, body);
      if (!bookmark) {
        throw new HttpError(404, 'Bookmark not found', 'NOT_FOUND');
      }

      res.status(200).json(bookmark);
    } catch (err) {
      next(err);
    }
  };
}

export function makeDeleteBookmark(db: SqliteDatabase): RequestHandler {
  return (req, res, next) => {
    try {
      const parsedId = bookmarkIdSchema.safeParse(req.params.id);
      if (!parsedId.success) {
        throw new HttpError(400, 'Invalid bookmark id', 'BAD_REQUEST');
      }

      const deleted = deleteBookmark(db, parsedId.data);
      if (!deleted) {
        throw new HttpError(404, 'Bookmark not found', 'NOT_FOUND');
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

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
