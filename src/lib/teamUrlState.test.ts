import { describe, expect, it, vi } from 'vitest';
import {
	TEAM_QUERY_PARAM,
	applyTeamCodeToUrl,
	findTeamByTeamCode,
	normalizeTeamCode,
	readTeamCodeFromLocation,
	readTeamCodeFromSearch,
	writeTeamCodeToHistory
} from './teamUrlState';

describe('normalizeTeamCode', () => {
	it('trims and lowercases', () => {
		expect(normalizeTeamCode('  NYY ')).toBe('nyy');
	});

	it('returns empty string for nullish', () => {
		expect(normalizeTeamCode(null)).toBe('');
		expect(normalizeTeamCode(undefined)).toBe('');
	});
});

describe('readTeamCodeFromSearch', () => {
	it(`reads ${TEAM_QUERY_PARAM} with or without leading ?`, () => {
		expect(readTeamCodeFromSearch('?team=bos')).toBe('bos');
		expect(readTeamCodeFromSearch('team=BOS&x=1')).toBe('bos');
	});

	it('returns null when missing or blank', () => {
		expect(readTeamCodeFromSearch('')).toBeNull();
		expect(readTeamCodeFromSearch('?foo=1')).toBeNull();
		expect(readTeamCodeFromSearch('?team=')).toBeNull();
		expect(readTeamCodeFromSearch('?team=%20')).toBeNull();
	});
});

describe('readTeamCodeFromLocation', () => {
	it('reads from a location-like search', () => {
		expect(readTeamCodeFromLocation({ search: '?team=nyy' })).toBe('nyy');
	});
});

describe('applyTeamCodeToUrl', () => {
	it('sets the team param', () => {
		const url = applyTeamCodeToUrl(new URL('https://example.com/app/'), 'NYY');
		expect(url.searchParams.get('team')).toBe('nyy');
	});

	it('removes the team param when cleared', () => {
		const url = applyTeamCodeToUrl(new URL('https://example.com/app/?team=bos&x=1'), null);
		expect(url.searchParams.has('team')).toBe(false);
		expect(url.searchParams.get('x')).toBe('1');
	});

	it('preserves pathname under a Pages subpath', () => {
		const url = applyTeamCodeToUrl(
			new URL('https://user.github.io/baseball-collection/?team=old'),
			'lad'
		);
		expect(url.pathname).toBe('/baseball-collection/');
		expect(url.searchParams.get('team')).toBe('lad');
	});
});

describe('writeTeamCodeToHistory', () => {
	it('pushState when the query changes', () => {
		const pushState = vi.fn();
		const replaceState = vi.fn();
		writeTeamCodeToHistory(
			'bos',
			'push',
			{ pushState, replaceState, state: { a: 1 } },
			{ href: 'https://example.com/' }
		);
		expect(pushState).toHaveBeenCalledWith({ a: 1 }, '', '/?team=bos');
		expect(replaceState).not.toHaveBeenCalled();
	});

	it('replaceState when mode is replace', () => {
		const pushState = vi.fn();
		const replaceState = vi.fn();
		writeTeamCodeToHistory(
			null,
			'replace',
			{ pushState, replaceState, state: null },
			{ href: 'https://example.com/?team=bos' }
		);
		expect(replaceState).toHaveBeenCalledWith(null, '', '/');
		expect(pushState).not.toHaveBeenCalled();
	});

	it('no-ops when href would be unchanged', () => {
		const pushState = vi.fn();
		const replaceState = vi.fn();
		writeTeamCodeToHistory(
			'nyy',
			'push',
			{ pushState, replaceState, state: null },
			{ href: 'https://example.com/?team=nyy' }
		);
		expect(pushState).not.toHaveBeenCalled();
		expect(replaceState).not.toHaveBeenCalled();
	});
});

describe('findTeamByTeamCode', () => {
	const teams = [
		{ id: 147, name: 'Yankees', teamCode: 'NYY' },
		{ id: 111, name: 'Red Sox', teamCode: 'BOS' }
	];

	it('matches case-insensitively', () => {
		expect(findTeamByTeamCode(teams, 'nyy')?.id).toBe(147);
		expect(findTeamByTeamCode(teams, 'BOS')?.name).toBe('Red Sox');
	});

	it('returns undefined for unknown or empty codes', () => {
		expect(findTeamByTeamCode(teams, 'xyz')).toBeUndefined();
		expect(findTeamByTeamCode(teams, '')).toBeUndefined();
		expect(findTeamByTeamCode(null, 'nyy')).toBeUndefined();
	});
});
