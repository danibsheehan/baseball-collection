import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { isAllowedOrigin } = require('./corsOrigins.cjs');

describe('isAllowedOrigin', () => {
  it('accepts an allowlisted dev origin', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:5173')).toBe(true);
  });

  it('rejects a non-allowlisted origin', () => {
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
  });

  it('rejects a missing origin', () => {
    expect(isAllowedOrigin(undefined)).toBe(false);
  });
});
