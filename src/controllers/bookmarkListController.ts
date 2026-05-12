import type { RequestHandler } from 'express';
import type { SqliteDatabase } from '../db/sqliteTypes';
import { parseTagsQueryParam } from '../models/bookmark';
import { listBookmarks } from '../services/bookmarkService';

function tagsFromQuery(tagsQuery: unknown): string[] {
  if (tagsQuery === undefined || tagsQuery === null) {
    return [];
  }
  if (Array.isArray(tagsQuery)) {
    return parseTagsQueryParam(tagsQuery.map(String).join(','));
  }
  if (typeof tagsQuery === 'string') {
    return parseTagsQueryParam(tagsQuery);
  }
  return [];
}

export function makeListBookmarks(db: SqliteDatabase): RequestHandler {
  return (req, res, next) => {
    try {
      const filterTags = tagsFromQuery(req.query.tags);
      const bookmarks = listBookmarks(
        db,
        filterTags.length > 0 ? filterTags : undefined,
      );
      res.status(200).json(bookmarks);
    } catch (err) {
      next(err);
    }
  };
}
