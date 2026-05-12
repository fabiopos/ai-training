/**
 * Subset of Node's `DatabaseSync` / `StatementSync` used by this app.
 * We avoid `import ... from 'node:sqlite'` because Vitest/Vite pre-bundling
 * resolves `node:sqlite` incorrectly on Windows.
 */
export interface SqliteStatement {
  get(...params: unknown[]): Record<string, unknown> | undefined;
}

export interface SqliteDatabase {
  exec(source: string): void;
  prepare(source: string): SqliteStatement;
}
