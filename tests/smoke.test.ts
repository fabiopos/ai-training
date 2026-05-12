import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('app bootstrap', () => {
  it('creates an Express application', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
