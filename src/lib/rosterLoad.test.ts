import { describe, expect, it, vi } from 'vitest';
import { fetchEnrichedRoster } from './rosterLoad';

describe('fetchEnrichedRoster', () => {
  it('returns sorted enriched players', async () => {
    const get = vi.fn((url: string) => {
      if (url.includes('roster')) {
        return Promise.resolve({
          data: {
            roster: [
              { person: { id: 2, fullName: 'B Player' } },
              { person: { id: 1, fullName: 'A Player' } },
            ],
          },
        });
      }
      if (url === 'people') {
        return Promise.resolve({
          data: {
            people: [
              { id: 1, fullName: 'A Player' },
              { id: 2, fullName: 'B Player' },
            ],
          },
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const result = await fetchEnrichedRoster({ get }, 147);
    expect(result.empty).toBe(false);
    expect(result.players.map((r) => r.person?.fullName)).toEqual(['A Player', 'B Player']);
    expect(result.players[0].playerInfo).toMatchObject({ id: 1, fullName: 'A Player' });
  });

  it('returns empty when roster has no person ids', async () => {
    const get = vi.fn().mockResolvedValue({ data: { roster: [{ person: {} }] } });
    const result = await fetchEnrichedRoster({ get }, 111);
    expect(result).toEqual({ players: [], empty: true });
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('enriches with empty playerInfo when people requests fail', async () => {
    const get = vi.fn((url: string) => {
      if (url.includes('roster')) {
        return Promise.resolve({
          data: { roster: [{ person: { id: 10, fullName: 'Solo' } }] },
        });
      }
      return Promise.reject(new Error('people down'));
    });

    const result = await fetchEnrichedRoster({ get }, 111);
    expect(result.empty).toBe(false);
    expect(result.players).toHaveLength(1);
    expect(result.players[0].playerInfo).toEqual({});
  });

  it('invokes onRosterLoaded before people enrichment', async () => {
    const order: string[] = [];
    const get = vi.fn((url: string) => {
      if (url.includes('roster')) {
        order.push('roster');
        return Promise.resolve({
          data: { roster: [{ person: { id: 1, fullName: 'A' } }] },
        });
      }
      order.push('people');
      return Promise.resolve({ data: { people: [{ id: 1, fullName: 'A' }] } });
    });

    await fetchEnrichedRoster({ get }, 1, {
      onRosterLoaded: () => {
        order.push('hook');
      },
    });
    expect(order).toEqual(['roster', 'hook', 'people']);
  });

  it('rejects when the roster request fails', async () => {
    const get = vi.fn().mockRejectedValue(new Error('network'));
    await expect(fetchEnrichedRoster({ get }, 147)).rejects.toThrow('network');
  });
});
