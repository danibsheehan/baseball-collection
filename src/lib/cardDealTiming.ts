/** Must match `.album__card-deal--animate` / `--many` durations (ms) for page-shadow timing */
export const DEAL_ANIM_MS = 1960;
export const DEAL_ANIM_MS_MANY = 1380;

export type RevealTiming = {
  staggerMs: number;
  maxDelayMs: number;
  durationMs: number;
};

export function getRevealTiming(playerCount: number): RevealTiming {
  const many = playerCount > 30;
  /* Stagger vs peel duration — keep each card legible while the peel runs longer */
  const staggerMs = many ? 36 : 52;
  const earlyN = Math.min(10, playerCount);
  const tight = staggerMs * 0.52;
  const lastI = Math.max(0, playerCount - 1);
  /* Uncapped delay for the last card in deal order — must not clip tail or the final wave “lags” the deck */
  const uncappedLast =
    lastI < earlyN ? lastI * tight : earlyN * tight + (lastI - earlyN) * staggerMs;
  const maxDelayMs = Math.min(Math.ceil(uncappedLast) + 96, many ? 3600 : 2000);
  return {
    staggerMs,
    maxDelayMs,
    durationMs: many ? DEAL_ANIM_MS_MANY : DEAL_ANIM_MS,
  };
}

/**
 * Ease-out stagger across the whole deck: early cards stay tight, gaps widen toward the tail
 * (rhythm reads more “hand-dealt” than uniform linear spacing).
 */
export function dealStaggerDelayMs(
  orderIndex: number,
  total: number,
  staggerMs: number,
  maxDelayMs: number,
): number {
  if (total <= 1) {
    return 0;
  }
  const earlyN = Math.min(10, total);
  const tight = staggerMs * 0.52;
  const lastI = total - 1;
  const linearLast = lastI < earlyN ? lastI * tight : earlyN * tight + (lastI - earlyN) * staggerMs;
  const span = Math.min(linearLast, maxDelayMs);
  const u = orderIndex / lastI;
  const eased = 1 - Math.pow(1 - u, 1.78);
  return Math.round(eased * span);
}

export function getMaxDealEndMs(playerCount: number): number {
  if (playerCount <= 0) {
    return 0;
  }
  const { staggerMs, maxDelayMs, durationMs } = getRevealTiming(playerCount);
  const maxDelay = dealStaggerDelayMs(
    Math.max(0, playerCount - 1),
    playerCount,
    staggerMs,
    maxDelayMs,
  );
  return maxDelay + durationMs;
}
