import type { SqliteDatabase } from '../db/sqliteTypes';
import { bookmarkEntitySchema, type Bookmark } from '../models/bookmark';

type BookmarkRow = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  tags: string;
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

export function findBookmarkById(db: SqliteDatabase, id: string): Bookmark | null {
  const stmt = db.prepare(
    'SELECT id, url, title, description, tags FROM bookmarks WHERE id = ?',
  );
  const row = stmt.get(id) as BookmarkRow | undefined;
  if (!row) {
    return null;
  }

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
