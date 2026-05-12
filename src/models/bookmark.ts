import { z } from 'zod';

/** UUID path param: trim, lowercase, then validate (SQLite id match is case-sensitive). */
export const bookmarkIdSchema = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
  z.string().uuid(),
);

/** Stored and returned bookmark entity */
export const bookmarkEntitySchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().nullable(),
  tags: z.array(z.string()),
});

export type Bookmark = z.infer<typeof bookmarkEntitySchema>;

/** Request body for creating a bookmark. */
export const createBookmarkBodySchema = z.object({
  url: z.string().url(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateBookmarkBody = z.infer<typeof createBookmarkBodySchema>;

/**
 * Parse `?tags=a,b` (and similar) into filter tokens: trim, lowercase, dedupe.
 * Empty segments are dropped. Order is first-seen.
 */
export function parseTagsQueryParam(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const token = part.trim().toLowerCase();
    if (!token || seen.has(token)) {
      continue;
    }
    seen.add(token);
    out.push(token);
  }
  return out;
}

/** Normalize user-provided tags for storage: trim, lowercase, dedupe, drop empties. */
export function normalizeTags(rawTags: string[] | undefined): string[] {
  if (!rawTags) {
    return [];
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const rawTag of rawTags) {
    const tag = rawTag.trim().toLowerCase();
    if (!tag || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    out.push(tag);
  }
  return out;
}
