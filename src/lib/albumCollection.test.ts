import { describe, expect, it, vi } from 'vitest';
import {
	ALBUM_STORAGE_KEY,
	countCollectedByTeamId,
	countCollectedForTeam,
	countCollectedOnRoster,
	createEmptyAlbumStore,
	filterRosterPlayersByAlbum,
	isCollected,
	normalizeAlbumStore,
	readAlbumStore,
	rosterCompletenessFillPercent,
	toggleCollected,
	writeAlbumStore
} from './albumCollection';

function memoryStorage(initial: Record<string, string> = {}): Storage {
	const map = new Map(Object.entries(initial));
	return {
		get length() {
			return map.size;
		},
		clear() {
			map.clear();
		},
		getItem(key: string) {
			return map.has(key) ? map.get(key)! : null;
		},
		key() {
			return null;
		},
		removeItem(key: string) {
			map.delete(key);
		},
		setItem(key: string, value: string) {
			map.set(key, String(value));
		}
	};
}

describe('normalizeAlbumStore', () => {
	it('returns empty for invalid payloads', () => {
		expect(normalizeAlbumStore(null)).toEqual(createEmptyAlbumStore());
		expect(normalizeAlbumStore({ version: 2, collected: {} })).toEqual(createEmptyAlbumStore());
		expect(normalizeAlbumStore({ version: 1 })).toEqual(createEmptyAlbumStore());
	});

	it('keeps valid collected entries', () => {
		const store = normalizeAlbumStore({
			version: 1,
			collected: {
				'12': { personId: 12, teamId: 147, collectedAt: '2020-01-01T00:00:00.000Z' },
				bad: { personId: 'nope' }
			}
		});
		expect(Object.keys(store.collected)).toEqual(['12']);
		expect(store.collected['12'].teamId).toBe(147);
	});
});

describe('readAlbumStore / writeAlbumStore', () => {
	it('round-trips through storage', () => {
		const storage = memoryStorage();
		const next = toggleCollected(createEmptyAlbumStore(), 99, {
			teamId: 111,
			now: new Date('2024-06-01T12:00:00.000Z')
		}).store;
		writeAlbumStore(next, storage);
		expect(storage.getItem(ALBUM_STORAGE_KEY)).toContain('"99"');
		expect(readAlbumStore(storage).collected['99'].personId).toBe(99);
	});

	it('returns empty when storage is missing or corrupt', () => {
		expect(readAlbumStore(null)).toEqual(createEmptyAlbumStore());
		const storage = memoryStorage({ [ALBUM_STORAGE_KEY]: '{not-json' });
		expect(readAlbumStore(storage)).toEqual(createEmptyAlbumStore());
	});

	it('writeAlbumStore no-ops without setItem', () => {
		expect(() => writeAlbumStore(createEmptyAlbumStore(), null)).not.toThrow();
	});
});

describe('toggleCollected / isCollected', () => {
	it('adds then removes a player', () => {
		const added = toggleCollected(createEmptyAlbumStore(), 7, { teamId: 147 });
		expect(added.collected).toBe(true);
		expect(isCollected(added.store, 7)).toBe(true);

		const removed = toggleCollected(added.store, 7);
		expect(removed.collected).toBe(false);
		expect(isCollected(removed.store, 7)).toBe(false);
	});

	it('treats nullish person ids as not collected', () => {
		expect(isCollected(createEmptyAlbumStore(), null)).toBe(false);
		expect(isCollected(null, 1)).toBe(false);
	});
});

describe('countCollectedOnRoster', () => {
	it('counts unique roster ids present in the album', () => {
		let store = createEmptyAlbumStore();
		store = toggleCollected(store, 1).store;
		store = toggleCollected(store, 2).store;
		store = toggleCollected(store, 99).store;
		expect(countCollectedOnRoster(store, [1, 2, 2, null, 3])).toBe(2);
	});
});

describe('countCollectedForTeam / countCollectedByTeamId', () => {
	it('tallies collect-time team ids', () => {
		let store = createEmptyAlbumStore();
		store = toggleCollected(store, 1, { teamId: 147 }).store;
		store = toggleCollected(store, 2, { teamId: 147 }).store;
		store = toggleCollected(store, 3, { teamId: 111 }).store;
		store = toggleCollected(store, 4).store;
		expect(countCollectedByTeamId(store)).toEqual({ 147: 2, 111: 1 });
		expect(countCollectedForTeam(store, 147)).toBe(2);
		expect(countCollectedForTeam(store, 111)).toBe(1);
		expect(countCollectedForTeam(store, 999)).toBe(0);
		expect(countCollectedForTeam(store, null)).toBe(0);
	});
});

describe('filterRosterPlayersByAlbum', () => {
	const roster = [
		{ person: { id: 1, fullName: 'A' } },
		{ person: { id: 2, fullName: 'B' } },
		{ person: { id: 3, fullName: 'C' } }
	];

	it('returns the full list for all / default', () => {
		const store = toggleCollected(createEmptyAlbumStore(), 1).store;
		expect(filterRosterPlayersByAlbum(roster, store, 'all')).toEqual(roster);
		expect(filterRosterPlayersByAlbum(roster, store)).toEqual(roster);
	});

	it('keeps only collected players for album filter', () => {
		let store = createEmptyAlbumStore();
		store = toggleCollected(store, 2).store;
		store = toggleCollected(store, 3).store;
		expect(filterRosterPlayersByAlbum(roster, store, 'album').map((r) => r.person.id)).toEqual([
			2, 3
		]);
	});

	it('returns empty when nothing collected', () => {
		expect(filterRosterPlayersByAlbum(roster, createEmptyAlbumStore(), 'album')).toEqual([]);
		expect(filterRosterPlayersByAlbum(null, createEmptyAlbumStore(), 'album')).toEqual([]);
	});
});

describe('rosterCompletenessFillPercent', () => {
	it('scales owned/total and clamps', () => {
		expect(rosterCompletenessFillPercent(0, 26)).toBe('0%');
		expect(rosterCompletenessFillPercent(13, 26)).toBe('50%');
		expect(rosterCompletenessFillPercent(26, 26)).toBe('100%');
		expect(rosterCompletenessFillPercent(40, 20)).toBe('100%');
	});
});

describe('readAlbumStore JSON parse errors', () => {
	it('swallows getItem throws', () => {
		const storage = {
			getItem: () => {
				throw new Error('denied');
			},
			setItem: vi.fn(),
			removeItem: vi.fn()
		};
		expect(readAlbumStore(storage)).toEqual(createEmptyAlbumStore());
	});
});
