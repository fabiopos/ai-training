import { Router } from 'express';
import type { SqliteDatabase } from '../db/sqliteTypes';
import { makeGetBookmarkById } from '../controllers/bookmarkController';

export function createBookmarksRouter(db: SqliteDatabase): Router {
  const router = Router();
  router.get('/:id', makeGetBookmarkById(db));
  return router;
}
