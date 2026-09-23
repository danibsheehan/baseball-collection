import { describe, expect, it } from 'vitest';
import { formatVintageDate } from './formatVintageDate';

describe('formatVintageDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatVintageDate('1993-08-24')).toBe('AUG 24, 1993');
  });

  it('formats a date with a time/offset suffix by using the date prefix', () => {
    expect(formatVintageDate('1993-08-24T00:00:00.000Z')).toBe('AUG 24, 1993');
  });

  it('does not zero-pad the day', () => {
    expect(formatVintageDate('2001-01-05')).toBe('JAN 5, 2001');
  });

  it('returns null for an invalid month', () => {
    expect(formatVintageDate('2001-13-05')).toBeNull();
  });

  it('returns null for a non-ISO string', () => {
    expect(formatVintageDate('not-a-date')).toBeNull();
  });

  it('returns null for empty, nullish, or non-string input', () => {
    expect(formatVintageDate('')).toBeNull();
    expect(formatVintageDate(null)).toBeNull();
    expect(formatVintageDate(undefined)).toBeNull();
    expect(formatVintageDate(19930824)).toBeNull();
  });
});
