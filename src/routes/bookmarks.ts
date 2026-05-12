import { Router } from 'express';
import type { SqliteDatabase } from '../db/sqliteTypes';
import {
  makeCreateBookmark,
  makeGetBookmarkById,
} from '../controllers/bookmarkController';
import { makeListBookmarks } from '../controllers/bookmarkListController';

export function createBookmarksRouter(db: SqliteDatabase): Router {
  const router = Router();
  router.get('/', makeListBookmarks(db));
  router.post('/', makeCreateBookmark(db));
  router.get('/:id', makeGetBookmarkById(db));
  return router;
}