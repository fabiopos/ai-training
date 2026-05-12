import type { SqliteDatabase } from '../db/sqliteTypes';
import { v4 as uuidv4 } from 'uuid';
import {
  bookmarkEntitySchema,
  normalizeTags,
  type Bookmark,
  type CreateBookmarkBody,
  type UpdateBookmarkBody,
} from '../models/bookmark';

type BookmarkRow = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  tags: string;
};

type RunResult = {
  changes?: number | bigint;
};

function parseTagsJson(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(String);
  } catch {
    return [];
  }
}

function rowToBookmark(row: BookmarkRow): Bookmark | null {
  const candidate: Bookmark = {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description,
    tags: parseTagsJson(row.tags),
  };
  const parsed = bookmarkEntitySchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

/** All bookmarks, stable order by id. */
export function listAllBookmarks(db: SqliteDatabase): Bookmark[] {
  const stmt = db.prepare(
    'SELECT id, url, title, description, tags FROM bookmarks ORDER BY id ASC',
  );
  const rows = stmt.all() as BookmarkRow[];
  const out: Bookmark[] = [];
  for (const row of rows) {
    const b = rowToBookmark(row);
    if (b) {
      out.push(b);
    }
  }
  return out;
}

/**
 * Filter bookmarks that contain **any** of the given tags (OR), case-insensitive.
 * `filterTags` must already be normalized (e.g. via {@link parseTagsQueryParam}).
 */
export function filterBookmarksByTagsAny(
  bookmarks: Bookmark[],
  filterTags: string[],
): Bookmark[] {
  if (filterTags.length === 0) {
    return bookmarks;
  }
  return bookmarks.filter((b) =>
    filterTags.some((ft) => b.tags.some((t) => t.toLowerCase() === ft)),
  );
}

export function listBookmarks(
  db: SqliteDatabase,
  filterTags?: string[],
): Bookmark[] {
  const all = listAllBookmarks(db);
  if (!filterTags || filterTags.length === 0) {
    return all;
  }
  return filterBookmarksByTagsAny(all, filterTags);
}

export function createBookmark(
  db: SqliteDatabase,
  body: CreateBookmarkBody,
): Bookmark {
  const bookmark: Bookmark = {
    id: uuidv4(),
    url: body.url,
    title: body.title,
    description: body.description ?? null,
    tags: normalizeTags(body.tags),
  };

  const stmt = db.prepare(
    'INSERT INTO bookmarks (id, url, title, description, tags) VALUES (?, ?, ?, ?, ?)',
  );
  stmt.run(
    bookmark.id,
    bookmark.url,
    bookmark.title,
    bookmark.description,
    JSON.stringify(bookmark.tags),
  );

  return bookmark;
}

export function updateBookmark(
  db: SqliteDatabase,
  id: string,
  body: UpdateBookmarkBody,
): Bookmark | null {
  const bookmark: Bookmark = {
    id,
    url: body.url,
    title: body.title,
    description: body.description ?? null,
    tags: normalizeTags(body.tags),
  };

  const stmt = db.prepare(
    'UPDATE bookmarks SET url = ?, title = ?, description = ?, tags = ? WHERE id = ?',
  );
  const result = stmt.run(
    bookmark.url,
    bookmark.title,
    bookmark.description,
    JSON.stringify(bookmark.tags),
    bookmark.id,
  ) as RunResult;

  if (result.changes === 0 || result.changes === 0n) {
    return null;
  }

  return bookmark;
}

export function findBookmarkById(db: SqliteDatabase, id: string): Bookmark | null {
  const stmt = db.prepare(
    'SELECT id, url, title, description, tags FROM bookmarks WHERE id = ?',
  );
  const row = stmt.get(id) as BookmarkRow | undefined;
  if (!row) {
    return null;
  }
  return rowToBookmark(row);
}
