import { describe, expect, it } from 'vitest';
import {
  DEAL_ANIM_MS,
  DEAL_ANIM_MS_MANY,
  dealStaggerDelayMs,
  getMaxDealEndMs,
  getRevealTiming,
} from './cardDealTiming';

describe('getRevealTiming', () => {
  it('uses the small-roster stagger and duration at/under 30 players', () => {
    const t = getRevealTiming(30);
    expect(t.staggerMs).toBe(52);
    expect(t.durationMs).toBe(DEAL_ANIM_MS);
  });

  it('switches to the "many" stagger and duration above 30 players', () => {
    const t = getRevealTiming(31);
    expect(t.staggerMs).toBe(36);
    expect(t.durationMs).toBe(DEAL_ANIM_MS_MANY);
  });

  it('caps maxDelayMs at the many-roster ceiling', () => {
    const t = getRevealTiming(60);
    expect(t.maxDelayMs).toBeLessThanOrEqual(3600);
  });

  it('caps maxDelayMs at the small-roster ceiling', () => {
    const t = getRevealTiming(30);
    expect(t.maxDelayMs).toBeLessThanOrEqual(2000);
  });
});

describe('dealStaggerDelayMs', () => {
  it('returns 0 when there is one or zero players', () => {
    expect(dealStaggerDelayMs(0, 1, 52, 2000)).toBe(0);
    expect(dealStaggerDelayMs(0, 0, 52, 2000)).toBe(0);
  });

  it('returns 0 for the first card in deal order', () => {
    expect(dealStaggerDelayMs(0, 25, 52, 2000)).toBe(0);
  });

  it('returns the full span for the last card in deal order', () => {
    const total = 25;
    const maxDelayMs = 2000;
    const delay = dealStaggerDelayMs(total - 1, total, 52, maxDelayMs);
    expect(delay).toBeLessThanOrEqual(maxDelayMs);
    expect(delay).toBeGreaterThan(0);
  });

  it('increases monotonically with order index', () => {
    const total = 40;
    const { staggerMs, maxDelayMs } = getRevealTiming(total);
    let prev = -1;
    for (let i = 0; i < total; i += 1) {
      const d = dealStaggerDelayMs(i, total, staggerMs, maxDelayMs);
      expect(d).toBeGreaterThanOrEqual(prev);
      prev = d;
    }
  });
});

describe('getMaxDealEndMs', () => {
  it('returns 0 for an empty roster', () => {
    expect(getMaxDealEndMs(0)).toBe(0);
  });

  it('is the last card delay plus its animation duration for a small roster', () => {
    const total = 12;
    const { staggerMs, maxDelayMs, durationMs } = getRevealTiming(total);
    const expectedDelay = dealStaggerDelayMs(total - 1, total, staggerMs, maxDelayMs);
    expect(getMaxDealEndMs(total)).toBe(expectedDelay + durationMs);
  });

  it('is the last card delay plus its animation duration for a "many" roster', () => {
    const total = 45;
    const { staggerMs, maxDelayMs, durationMs } = getRevealTiming(total);
    const expectedDelay = dealStaggerDelayMs(total - 1, total, staggerMs, maxDelayMs);
    expect(getMaxDealEndMs(total)).toBe(expectedDelay + durationMs);
  });
});
