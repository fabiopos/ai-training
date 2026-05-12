import 'dotenv/config';

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    return fallback;
  }
  return n;
}

function parseDatabasePath(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (trimmed) {
    return trimmed;
  }
  return './data/bookmarks.db';
}

export const env = {
  port: parsePort(process.env.PORT, 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databasePath: parseDatabasePath(process.env.DATABASE_PATH),
} as const;
