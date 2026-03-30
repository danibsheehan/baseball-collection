import { describe, expect, it } from 'vitest';
import {
	PEOPLE_BATCH_SIZE,
	chunkPersonIds,
	enrichRosterWithPlayerInfo,
	peopleByIdFromResponses,
	uniquePersonIds
} from './rosterPeople';

describe('uniquePersonIds', () => {
	it('dedupes while preserving first-seen order', () => {
		expect(uniquePersonIds([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
	});

	it('drops falsy entries', () => {
		expect(uniquePersonIds([1, null, 2, undefined, 0, 3])).toEqual([1, 2, 3]);
	});
});

describe('chunkPersonIds', () => {
	it('returns empty for empty input', () => {
		expect(chunkPersonIds([], 50)).toEqual([]);
	});

	it('splits at batch size', () => {
		const ids = Array.from({ length: 51 }, (_, i) => i + 1);
		const chunks = chunkPersonIds(ids, PEOPLE_BATCH_SIZE);
		expect(chunks).toHaveLength(2);
		expect(chunks[0]).toHaveLength(50);
		expect(chunks[1]).toEqual([51]);
	});
});

describe('peopleByIdFromResponses', () => {
	it('flattens people and maps by id', () => {
		const byId = peopleByIdFromResponses([
			{ data: { people: [{ id: 1, fullName: 'A' }] } },
			{ data: { people: [{ id: 2, fullName: 'B' }] } }
		]);
		expect(byId[1]).toEqual({ id: 1, fullName: 'A' });
		expect(byId[2]).toEqual({ id: 2, fullName: 'B' });
	});

	it('handles missing people arrays', () => {
		expect(peopleByIdFromResponses([{ data: {} }, {}])).toEqual({});
	});

	it('last duplicate id wins', () => {
		const byId = peopleByIdFromResponses([
			{ data: { people: [{ id: 1, n: 'first' }, { id: 1, n: 'second' }] } }
		]);
		expect(byId[1].n).toBe('second');
	});
});

describe('enrichRosterWithPlayerInfo', () => {
	it('merges playerInfo from byId', () => {
		const roster = [
			{ person: { id: 10 }, role: 'P' },
			{ person: { id: 99 }, role: 'C' }
		];
		const byId = {
			10: { id: 10, fullName: 'Pitcher' }
		};
		const out = enrichRosterWithPlayerInfo(roster, byId);
		expect(out[0].playerInfo).toEqual({ id: 10, fullName: 'Pitcher' });
		expect(out[1].playerInfo).toEqual({});
	});
});
