import { computed, nextTick, onUnmounted, ref, watch, type Ref } from 'vue';
import { dealStaggerDelayMs, getMaxDealEndMs, getRevealTiming } from './cardDealTiming';

/** Subset of AlbumPackLottie's exposed instance this composable needs. */
type PackRevealInstance = {
  getPackEl?: () => HTMLElement | null;
};

export type UseCardDealAnimationArgs = {
  players: Ref<Array<{ person?: { id?: number } }>>;
  rosterLoading: Ref<boolean>;
  resultsSection: Ref<HTMLElement | null>;
  binderRef: Ref<HTMLElement | null>;
};

/** Parent backstop if the pack never emits (slow network, wedged Lottie). Must exceed worst-case fetch + JSON duration. */
const PACK_UNWRAP_FALLBACK_MS = 14000;

function doubleRaf() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** Synchronous top scroll — avoids `scroll-behavior: smooth` on ancestors delaying the deal */
function scrollElementTopInstant(el: HTMLElement, marginTop = 10) {
  if (typeof el.getBoundingClientRect !== 'function' || typeof window === 'undefined') {
    return;
  }
  const top = Math.max(0, window.scrollY + el.getBoundingClientRect().top - marginTop);
  try {
    window.scrollTo({ left: window.scrollX, top, behavior: 'instant' });
  } catch {
    window.scrollTo(window.scrollX, top);
  }
}

/**
 * Orchestrates the shared pack-unwrap → CSS card-deal animation for a freshly loaded roster:
 * `idle → opening → measuring → ready → settled` (or `static` under reduced motion).
 */
export function useCardDealAnimation({
  players,
  rosterLoading,
  resultsSection,
  binderRef,
}: UseCardDealAnimationArgs) {
  /** Pack Lottie — used to aim card deal motion at the pack bounds. */
  const packRevealRef = ref<PackRevealInstance | null>(null);
  /** Matches `albumDealRunId` for the in-flight unwrap so Lottie can tag `unwrap-complete`. */
  const dealPackRunId = ref(0);
  const binderSettling = ref(false);

  /** idle | opening (one shared pack unwrap) | measuring | ready (CSS deal) | settled | static */
  const dealPhase = ref<'idle' | 'opening' | 'measuring' | 'ready' | 'settled' | 'static'>('idle');

  const cardDealPhaseClass = computed(() => {
    switch (dealPhase.value) {
      case 'opening':
        return 'album__card-deal--measuring';
      case 'measuring':
        return 'album__card-deal--measuring';
      case 'ready':
        return 'album__card-deal--animate';
      case 'settled':
      case 'static':
        return 'album__card-deal--static';
      default:
        return 'album__card-deal--idle';
    }
  });

  /** Soft margin “page weight” under the first row while cards reveal */
  const deckShadowVisible = ref(false);
  let dealCompleteTimer: ReturnType<typeof setTimeout> | null = null;
  let packOpenTimer: ReturnType<typeof setTimeout> | null = null;
  /** Increment when a new roster deal sequence starts so stale timeouts / Lottie events no-op */
  const albumDealRunId = ref(0);

  watch(
    dealPhase,
    (phase) => {
      if (phase === 'idle' || phase === 'static' || phase === 'settled' || phase === 'opening') {
        deckShadowVisible.value = false;
        return;
      }
      const n = players.value.length;
      if (!n) {
        deckShadowVisible.value = false;
        return;
      }
      if (phase === 'measuring' || phase === 'ready') {
        deckShadowVisible.value = true;
      }
    },
    { flush: 'post' },
  );

  onUnmounted(() => {
    if (dealCompleteTimer != null) {
      clearTimeout(dealCompleteTimer);
      dealCompleteTimer = null;
    }
    if (packOpenTimer != null) {
      clearTimeout(packOpenTimer);
      packOpenTimer = null;
    }
  });

  function onBinderSettleEnd(event: AnimationEvent) {
    const el = binderRef.value;
    if (!el || event.target !== el) {
      return;
    }
    const name = event.animationName || '';
    if (
      name !== 'album-binder-settle' &&
      name !== 'album-binder-settle-dark' &&
      name !== 'album-binder-settle-rm'
    ) {
      return;
    }
    binderSettling.value = false;
  }

  /**
   * Focus results (a11y) and optionally scroll them into view.
   * - `skipScroll`: no scroll — use before measuring deal vectors so the viewport (and album) stay put
   * - `instantScroll`: align section top to viewport (avoid on pack→cards handoff — it repositions the whole album)
   */
  function prepareResultsForDealMeasure(
    opts: { skipScroll?: boolean; instantScroll?: boolean } = {},
  ) {
    const el = resultsSection.value;
    if (!el) {
      return;
    }
    if (typeof el.focus === 'function') {
      el.focus({ preventScroll: true });
    }
    if (opts.skipScroll) {
      return;
    }
    if (opts.instantScroll) {
      scrollElementTopInstant(el, 10);
      return;
    }
    if (typeof el.scrollIntoView === 'function') {
      /* `nearest` avoids snapping the entire binder when the section is already mostly on-screen */
      try {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      } catch {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
      }
    }
  }

  /**
   * After the pack unwrap: each card’s rest pose is its grid slot.
   * Origin is the on-screen pack opening (center flap / “mouth”) when available so cards read as
   * dealing out of the pack; otherwise falls back to stack bottom center.
   *
   * Runs once per deal (before `ready`): one batched `getBoundingClientRect` pass over wrappers,
   * then writes custom properties — avoids interleaved read/write layout thrash.
   */
  function measureAlbumRevealOffsets() {
    const root = resultsSection.value;
    if (!root || typeof window === 'undefined') {
      return false;
    }
    const stackEl = root.querySelector('.album__results-stack');
    const stackRect = stackEl?.getBoundingClientRect() ?? root.getBoundingClientRect();
    let packX = stackRect.left + stackRect.width * 0.5;
    let packY = stackRect.bottom - Math.min(104, Math.max(40, stackRect.height * 0.1));

    const inst = packRevealRef.value;
    const packEl =
      inst && typeof inst.getPackEl === 'function'
        ? inst.getPackEl()
        : root.querySelector('.album__pack-lottie');
    if (packEl && typeof packEl.getBoundingClientRect === 'function') {
      const pr = packEl.getBoundingClientRect();
      if (pr.width > 2 && pr.height > 2) {
        packX = pr.left + pr.width * 0.5;
        /* Slightly below the horizontal seam = where the lower flap hinged (cards exit) */
        packY = pr.top + pr.height * 0.56;
      }
    }

    const wrappers = root.querySelectorAll<HTMLElement>('.album__card-deal');
    if (!wrappers.length) {
      return false;
    }
    wrappers.forEach((el) => {
      el.removeAttribute('data-deal-act');
      el.style.removeProperty('--deal-cap-delay');
      el.style.removeProperty('--deal-lead-boost');
    });
    const total = players.value.length;
    const { staggerMs, maxDelayMs, durationMs } = getRevealTiming(total);
    const many = total > 30;
    /* Slightly longer vectors so paths from the on-screen pack read cleanly to upper grid slots */
    const maxFly = many ? 380 : 560;

    const items = Array.from(wrappers).map((el) => {
      const rect = el.getBoundingClientRect();
      return { el, rect, top: rect.top, left: rect.left };
    });
    const rowBucket = (top: number) => Math.round(top / 40);
    items.sort((a, b) => {
      const ra = rowBucket(a.top);
      const rb = rowBucket(b.top);
      if (ra !== rb) {
        return ra - rb;
      }
      return a.left - b.left;
    });

    items.forEach(({ el, rect }, orderIndex) => {
      const slotCx = rect.left + rect.width / 2;
      const slotCy = rect.top + rect.height / 2;
      let fromX = packX - slotCx;
      let fromY = packY - slotCy;
      const dist = Math.hypot(fromX, fromY);
      if (dist > maxFly && dist > 0) {
        const scale = maxFly / dist;
        fromX *= scale;
        fromY *= scale;
      }

      /* Deck-style fan: angle sweeps across deal order (not a short repeating cycle) */
      const tNorm = total <= 1 ? 0.5 : orderIndex / (total - 1);
      const side = tNorm * 2 - 1;
      let ryFan = side * (many ? 20 : 34);
      let rzArc = side * (many ? 11 : 19);
      const isLead = orderIndex === 0;
      const isCap = orderIndex === items.length - 1;
      if (isLead) {
        /* Act 3 — lead card “breaks” the fan slightly harder than the wave */
        ryFan *= 1.22;
        rzArc *= 1.25;
        fromX *= 1.08;
        fromY *= 1.08;
        el.style.setProperty('--deal-lead-boost', '1.09');
      }

      el.style.setProperty('--deal-from-x', `${fromX}px`);
      el.style.setProperty('--deal-from-y', `${fromY}px`);
      if (isLead && isCap) {
        el.setAttribute('data-deal-act', 'both');
      } else if (isLead) {
        el.setAttribute('data-deal-act', 'lead');
      } else if (isCap) {
        el.setAttribute('data-deal-act', 'cap');
      }
      const twistJitter = (((orderIndex * 13) % 9) - 4) * 0.55;
      el.style.setProperty('--deal-ry-start', many ? '46deg' : '56deg');
      el.style.setProperty('--deal-ry-fan', `${ryFan.toFixed(2)}deg`);
      el.style.setProperty('--deal-rz-arc', `${rzArc.toFixed(2)}deg`);
      el.style.setProperty('--deal-twist', `${twistJitter.toFixed(2)}deg`);
      el.style.setProperty('--deal-layer', String(orderIndex));

      const delayMs = dealStaggerDelayMs(orderIndex, total, staggerMs, maxDelayMs);
      el.style.setProperty('--deal-delay', `${delayMs}ms`);
      if (isCap) {
        el.style.setProperty('--deal-cap-delay', `${delayMs + durationMs}ms`);
      }
    });
    return true;
  }

  async function continueDealAfterPackOpen(runId: number) {
    if (runId !== albumDealRunId.value) {
      return;
    }
    if (dealPhase.value !== 'opening') {
      return;
    }
    if (packOpenTimer != null) {
      clearTimeout(packOpenTimer);
      packOpenTimer = null;
    }

    /* Do not scroll here — instant scroll was jumping the full album/page right as the deal starts */
    prepareResultsForDealMeasure({ skipScroll: true });
    await doubleRaf();
    if (runId !== albumDealRunId.value || dealPhase.value !== 'opening') {
      return;
    }
    measureAlbumRevealOffsets();
    if (runId !== albumDealRunId.value || dealPhase.value !== 'opening') {
      return;
    }
    dealPhase.value = 'ready';

    const n = players.value.length;
    const settleAfterMs = getMaxDealEndMs(n) + 160;
    dealCompleteTimer = setTimeout(() => {
      dealCompleteTimer = null;
      if (runId !== albumDealRunId.value || dealPhase.value !== 'ready') {
        return;
      }
      /* Drop page-shadow first (no leave transition — it sat above cards and read as a post-deal glitch). */
      deckShadowVisible.value = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (runId !== albumDealRunId.value || dealPhase.value !== 'ready') {
            return;
          }
          dealPhase.value = 'settled';
        });
      });
    }, settleAfterMs);
  }

  function onPackUnwrapComplete(runId: number) {
    continueDealAfterPackOpen(runId);
  }

  watch(
    [players, rosterLoading],
    async () => {
      if (dealCompleteTimer != null) {
        clearTimeout(dealCompleteTimer);
        dealCompleteTimer = null;
      }
      if (packOpenTimer != null) {
        clearTimeout(packOpenTimer);
        packOpenTimer = null;
      }
      if (rosterLoading.value || players.value.length === 0) {
        dealPhase.value = 'idle';
        binderSettling.value = false;
        return;
      }

      albumDealRunId.value += 1;
      const runId = albumDealRunId.value;
      dealPackRunId.value = runId;
      binderSettling.value = false;
      await nextTick();
      binderSettling.value = true;
      /* Instant layout path: no pack stage, no `measureAlbumRevealOffsets` / peel — see reduced-motion CSS */
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        dealPhase.value = 'static';
        return;
      }

      dealPhase.value = 'opening';
      await nextTick();
      prepareResultsForDealMeasure();

      packOpenTimer = setTimeout(() => {
        packOpenTimer = null;
        continueDealAfterPackOpen(runId);
      }, PACK_UNWRAP_FALLBACK_MS);
    },
    { flush: 'post' },
  );

  return {
    packRevealRef,
    dealPackRunId,
    binderSettling,
    dealPhase,
    cardDealPhaseClass,
    deckShadowVisible,
    onPackUnwrapComplete,
    onBinderSettleEnd,
  };
}
