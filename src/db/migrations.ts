import type { SqliteDatabase } from './sqliteTypes';

const BOOKMARKS_DDL = `
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT NOT NULL DEFAULT '[]'
);
`;

export function runMigrations(db: SqliteDatabase): void {
  db.exec(BOOKMARKS_DDL);
}
