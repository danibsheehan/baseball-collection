import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
	validatePersonIdsQuery,
	validatePlayerIdParam
} = require('./peopleQueryValidation.cjs');

describe('validatePersonIdsQuery', () => {
	it('accepts a single numeric id', () => {
		expect(validatePersonIdsQuery('12345')).toEqual({
			ok: true,
			trimmedIds: '12345'
		});
	});

	it('accepts comma-separated numeric ids', () => {
		expect(validatePersonIdsQuery('1,2,3')).toEqual({
			ok: true,
			trimmedIds: '1,2,3'
		});
	});

	it('trims whitespace', () => {
		expect(validatePersonIdsQuery('  10,20  ')).toEqual({
			ok: true,
			trimmedIds: '10,20'
		});
	});

	it('rejects missing / empty', () => {
		expect(validatePersonIdsQuery(undefined).ok).toBe(false);
		expect(validatePersonIdsQuery(null).ok).toBe(false);
		expect(validatePersonIdsQuery('').ok).toBe(false);
		expect(validatePersonIdsQuery('   ').ok).toBe(false);
		expect(validatePersonIdsQuery(123).ok).toBe(false);
	});

	it('rejects non-numeric tokens', () => {
		const r = validatePersonIdsQuery('1,abc,3');
		expect(r.ok).toBe(false);
		expect(r.message).toMatch(/comma-separated numeric/);
	});

	it('rejects leading comma', () => {
		expect(validatePersonIdsQuery(',1,2').ok).toBe(false);
	});

	it('rejects trailing comma', () => {
		expect(validatePersonIdsQuery('1,2,').ok).toBe(false);
	});

	it('rejects empty segments between commas', () => {
		expect(validatePersonIdsQuery('1,,2').ok).toBe(false);
	});
});

describe('validatePlayerIdParam', () => {
	it('accepts digits only', () => {
		expect(validatePlayerIdParam('660271')).toEqual({ ok: true });
	});

	it('rejects non-numeric', () => {
		const r = validatePlayerIdParam('12a');
		expect(r.ok).toBe(false);
		expect(r.message).toBe('Invalid player id.');
	});

	it('rejects empty string', () => {
		expect(validatePlayerIdParam('').ok).toBe(false);
	});
});
