import { describe, expect, it } from 'vitest';
import { filterMajorLeagueBaseballTeams } from './filterMlbTeams';

describe('filterMajorLeagueBaseballTeams', () => {
	it('keeps MLB teams only', () => {
		const teams = [
			{ id: 1, name: 'Yankees', sport: { name: 'Major League Baseball' } },
			{ id: 2, name: 'Mets', sport: { name: 'Major League Baseball' } },
			{ id: 3, name: 'Other', sport: { name: 'Minor League Baseball' } }
		];
		expect(filterMajorLeagueBaseballTeams(teams)).toHaveLength(2);
		expect(filterMajorLeagueBaseballTeams(teams).map((t) => t.id)).toEqual([1, 2]);
	});

	it('drops teams without sport', () => {
		expect(filterMajorLeagueBaseballTeams([{ id: 1, name: 'X' }])).toEqual([]);
	});

	it('treats null/undefined input as empty list', () => {
		expect(filterMajorLeagueBaseballTeams(null)).toEqual([]);
		expect(filterMajorLeagueBaseballTeams(undefined)).toEqual([]);
	});
});
