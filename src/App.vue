<template>
	<div id="app">
		<p class="visually-hidden" aria-live="polite" aria-atomic="true">{{ liveRegionText }}</p>
		<div v-if="teamsError" class="app__banner app__banner--error" role="alert">
			{{ teamsError }}
		</div>
		<header class="app__title app__title--masthead">
			<div class="app__title-tv-safe">
				<div class="app__title-woodcut" aria-hidden="true">
					<!-- Woodcut-style ball (single mark) — reads like letterpress / early TV graphics -->
					<svg
						class="app__title-woodcut__svg"
						viewBox="0 0 72 72"
						xmlns="http://www.w3.org/2000/svg"
						focusable="false"
					>
						<circle
							cx="36"
							cy="36"
							r="30"
							fill="none"
							stroke="currentColor"
							stroke-width="2.65"
							stroke-dasharray="3 2"
							opacity="0.96"
						/>
						<circle class="app__title-woodcut__tick" cx="36" cy="9" r="2.35" />
						<path
							d="M36 10v52M14 36h44"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							opacity="0.35"
						/>
						<path
							d="M22 24c4 2 8 2 12 0M38 24c4 2 8 2 12 0M22 48c4-2 8-2 12 0M38 48c4-2 8-2 12 0"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="square"
						/>
					</svg>
				</div>
				<div class="app__title-text">
					<div class="app__title-kicker-wrap">
						<p class="app__title-kicker">Pasteboard album</p>
					</div>
					<h1 class="album__search--title">Club checklist</h1>
					<p class="app__title-subtitle">
						American / National loop — one club, one roster. Pick your side and complete your run.
					</p>
				</div>
			</div>
		</header>
		<main class="app__main">
			<div class="app__shell">
				<div class="app__rail app__rail--paper">
					<span class="app__folio app__folio--checklist" aria-hidden="true">1</span>
					<div class="album__search album__search--picker">
						<p v-if="teamsLoading" class="album__status" role="status">
							<span class="album__loading-row">
								<span class="album__loading-copy">
									Working the league sheet
									<span class="album__type-caret" aria-hidden="true"></span>
								</span>
								<span class="album__print-dots" aria-hidden="true">
									<span class="album__print-dot"></span>
									<span class="album__print-dot"></span>
									<span class="album__print-dot"></span>
								</span>
							</span>
						</p>
						<nav class="teams__nav" aria-label="Major League Baseball teams">
							<div class="teams__picker-print-frame">
								<div class="teams__picker-panel">
									<div class="teams__picker-merch" aria-hidden="true">
										<span class="teams__picker-merch-star">★</span>
										<span class="teams__picker-merch-star">★</span>
									</div>
									<div class="teams__picker-head">
										<label class="teams__search-label" for="team-search">Spot a club</label>
										<input
											id="team-search"
											v-model="teamSearchQuery"
											class="teams__search-input"
											type="search"
											name="team-search"
											placeholder="City, nickname, yard, or league…"
											autocomplete="off"
											spellcheck="false"
											:disabled="teamsLoading || !!teamsError || !teams.length"
										/>
									</div>
									<p
										v-if="!teamsLoading && teams.length && !filteredTeamSections.length"
										class="teams__search-empty"
										role="status"
									>
										No club matches “{{ teamSearchQuery.trim() }}”.
									</p>
									<template v-else>
										<div
											class="teams__sections"
											:class="teamsSectionsLayoutClass"
										>
											<section
												v-for="section in displayTeamSections"
												:key="section.id"
												class="teams__section"
											>
												<h3
													v-if="section.label"
													class="teams__section-title"
													:id="section.id"
												>
													{{ section.label }}
												</h3>
												<div
													class="teams__container"
													:role="section.label ? 'group' : undefined"
													:aria-labelledby="section.label ? section.id : undefined"
												>
													<Team
														v-for="team in section.teams"
														:key="team.id"
														:team="team"
														:selected="selectedTeamId === team.id"
														@updatePlayers="loadPlayers"
														@updateTeam="loadTeam"
														@liveMessage="setLiveMessage"
														@rosterLoading="setRosterLoading"
														@rosterLoadStage="setRosterLoadStage"
													/>
												</div>
											</section>
										</div>
									</template>
								</div>
							</div>
						</nav>
					</div>
				</div>
				<div ref="feltRailRef" class="app__rail app__rail--felt">
					<span class="app__folio app__folio--cards" aria-hidden="true">2</span>
					<div
						ref="binderRef"
						class="album__binder"
						:class="{ 'album__binder--settle': binderSettling }"
						@animationend="onBinderSettleEnd"
					>
						<section
							ref="resultsSection"
							class="album__results"
							:class="{ 'album__results--many-cards': players.length > 30 }"
							aria-label="Player cards"
							tabindex="-1"
							:aria-busy="rosterLoading ? true : undefined"
						>
							<p v-if="rosterLoading" class="album__results-status" role="status">
								<span class="album__loading-row">
									<span class="album__loading-copy">
										{{ rosterLoadingHeadline }}
										<span class="album__type-caret" aria-hidden="true"></span>
									</span>
									<span class="album__print-dots" aria-hidden="true">
										<span class="album__print-dot"></span>
										<span class="album__print-dot"></span>
										<span class="album__print-dot"></span>
									</span>
								</span>
							</p>
							<p
								v-if="!rosterLoading && selectedTeamId === null"
								class="album__results-placeholder"
							>
								Open the checklist — pick a club to start your run.
							</p>
							<div
								v-if="selectedTeamId !== null"
								class="album__results-main"
								:class="{ 'album__results-main--loading': rosterLoading }"
							>
								<div
									v-if="!rosterLoading"
									class="album__results-stack"
									:class="{ 'album__results-stack--deal-motion': dealPhase === 'ready' }"
								>
									<div
										v-if="players.length"
										ref="pennantRef"
										:key="selectedTeamId"
										class="album__results-heading"
										:data-theme="theme || undefined"
									>
										<h2 class="album__results--title">
											Your Baseball Cards for the {{ teamName }}!
										</h2>
										<p class="album__results-completeness">
											<span class="album__results-completeness-count">
												{{ players.length }} {{ players.length === 1 ? 'card' : 'cards' }}
											</span>
											<span class="album__results-completeness-track" aria-hidden="true">
												<span
													class="album__results-completeness-fill"
													:style="{ width: rosterCompletenessFillPercent }"
												></span>
											</span>
									</p>
								</div>
								<div
									v-if="players.length"
									class="album__results-cards-region"
									:class="{
										'album__results-cards-region--rm-reveal': dealPhase === 'static'
									}"
								>
									<div
										v-if="dealPhase === 'opening'"
										class="album__deck-anticipation"
										aria-hidden="true"
									></div>
									<div
										class="album__deck-shadow"
										:class="{ 'album__deck-shadow--hidden': !deckShadowVisible }"
										aria-hidden="true"
									></div>
									<Transition name="album-pack-out">
										<div
											v-if="dealPhase === 'opening'"
											class="album__pack-stage album__pack-stage--deal-act1"
										>
											<AlbumPackLottie
												ref="packRevealRef"
												:deal-phase="dealPhase"
												:run-id="dealPackRunId"
												@unwrap-complete="onPackUnwrapComplete"
											/>
										</div>
									</Transition>
									<div
										v-for="player in players"
										:key="player.person.id"
										class="album__card-deal"
										:class="[
											players.length > 30 ? 'album__card-deal--many' : '',
											cardDealPhaseClass
										]"
									>
										<BaseballCard
											:player="player"
											:theme="theme"
											:teamName="teamName"
											:manyPlayers="players.length > 30"
										/>
									</div>
								</div>
								<p
									v-if="!players.length"
									class="album__results-empty"
								>
									No pasteboards on file for the {{ teamName }}.
								</p>
								</div>
								<Transition name="album-skel-fade">
									<div
										v-if="rosterLoading"
										:key="`skel-${selectedTeamId}`"
										class="album__skeleton-overlay"
										aria-hidden="true"
									>
										<div class="album__skeleton-block">
											<div
												v-for="slot in skeletonSlots"
												:key="`slot-${slot}`"
												class="album__skeleton-card"
											>
												<div class="album__skeleton-card-inner"></div>
											</div>
										</div>
									</div>
								</Transition>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import AlbumPackLottie from './components/AlbumPackLottie.vue';
import BaseballCard from './components/BaseballCard.vue';
import Team from './components/Team.vue';
import http from './http-common';
import { filterMajorLeagueBaseballTeams } from './lib/filterMlbTeams';
import {
	buildTeamPickerSections,
	filterTeamPickerSections
} from './lib/teamPickerSections';
import { useBinderPennantParallax } from './lib/useBinderPennantParallax';

const players = ref([]);
const teamName = ref('');
const selectedTeamId = ref(null);
const teams = ref([]);
const theme = ref('');
const teamsLoading = ref(true);
const teamsError = ref('');
const liveRegionText = ref('');
const rosterLoading = ref(false);
/** 'idle' | 'pulling' | 'faces' — from Team.vue while a roster request is in flight */
const rosterLoadStage = ref('idle');
const resultsSection = ref(null);
const binderRef = ref(null);
const pennantRef = ref(null);
const feltRailRef = ref(null);

useBinderPennantParallax({
	binderRef,
	pennantRef,
	feltRailRef,
	options: {
		enabled: false,
		binderMaxY: 6,
		pennantMaxX: 9,
		pennantMaxY: 4,
		pennantMaxRz: 1.6,
		pointerLerp: 0.11,
		scrollLerp: 0.1
	}
});
/** Pack Lottie — used to aim card deal motion at the pack bounds. */
const packRevealRef = ref(null);
/** Matches `albumDealRunId` for the in-flight unwrap so Lottie can tag `unwrap-complete`. */
const dealPackRunId = ref(0);
const binderSettling = ref(false);
const teamSearchQuery = ref('');

/** idle | opening (one shared pack unwrap) | measuring | ready (CSS deal) | settled | static */
const dealPhase = ref('idle');

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

const teamPickerSections = computed(() => buildTeamPickerSections(teams.value));

const filteredTeamSections = computed(() =>
	filterTeamPickerSections(teamPickerSections.value, teamSearchQuery.value)
);

/** While loading or empty API, avoid flashing “no matches” before sections exist. */
const displayTeamSections = computed(() => {
	if (teamsLoading.value || !teams.value.length) {
		return teamPickerSections.value;
	}
	return filteredTeamSections.value;
});

/** Program layout: side-by-side league columns on wide checklist rail when AL + NL. */
const teamsSectionsLayoutClass = computed(() => {
	const n = displayTeamSections.value.length;
	if (n <= 1) {
		return 'teams__sections--solo';
	}
	if (n === 2) {
		return 'teams__sections--duo';
	}
	return 'teams__sections--multi';
});

/** Full “album page” at 40 cards; bar is a collecting metaphor, not league totals. */
const rosterCompletenessFillPercent = computed(() => {
	const n = players.value.length;
	if (n <= 0) {
		return '0%';
	}
	return `${Math.min(100, (n / 40) * 100)}%`;
});

const rosterLoadingHeadline = computed(() => {
	if (rosterLoadStage.value === 'faces') {
		return 'Mounting portraits…';
	}
	return 'Pulling the club sheet…';
});

/** Placeholder card-backs while the roster / people requests run */
const skeletonSlots = Array.from({ length: 12 }, (_, i) => i + 1);

/** Must match `.album__card-deal--animate` / `--many` durations (ms) for page-shadow timing */
const DEAL_ANIM_MS = 1960;
const DEAL_ANIM_MS_MANY = 1380;
/** Parent backstop if the pack never emits (slow network, wedged Lottie). Must exceed worst-case fetch + JSON duration. */
const PACK_UNWRAP_FALLBACK_MS = 14000;

function getRevealTiming(playerCount) {
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
		durationMs: many ? DEAL_ANIM_MS_MANY : DEAL_ANIM_MS
	};
}

/**
 * Ease-out stagger across the whole deck: early cards stay tight, gaps widen toward the tail
 * (rhythm reads more “hand-dealt” than uniform linear spacing).
 */
function dealStaggerDelayMs(orderIndex, total, staggerMs, maxDelayMs) {
	if (total <= 1) {
		return 0;
	}
	const earlyN = Math.min(10, total);
	const tight = staggerMs * 0.52;
	const lastI = total - 1;
	const linearLast =
		lastI < earlyN ? lastI * tight : earlyN * tight + (lastI - earlyN) * staggerMs;
	const span = Math.min(linearLast, maxDelayMs);
	const u = orderIndex / lastI;
	const eased = 1 - Math.pow(1 - u, 1.78);
	return Math.round(eased * span);
}

function getMaxDealEndMs(playerCount) {
	if (playerCount <= 0) {
		return 0;
	}
	const { staggerMs, maxDelayMs, durationMs } = getRevealTiming(playerCount);
	const maxDelay = dealStaggerDelayMs(Math.max(0, playerCount - 1), playerCount, staggerMs, maxDelayMs);
	return maxDelay + durationMs;
}

/** Soft margin “page weight” under the first row while cards reveal */
const deckShadowVisible = ref(false);
let dealCompleteTimer = null;
let packOpenTimer = null;
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
	{ flush: 'post' }
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

function onBinderSettleEnd(event) {
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

function focusResultsSection() {
	nextTick(() => {
		const el = resultsSection.value;
		if (!el || typeof el.focus !== 'function') {
			return;
		}
		el.focus({ preventScroll: true });
		if (typeof el.scrollIntoView === 'function') {
			try {
				el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
			} catch {
				el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
			}
		}
	});
}

watch(selectedTeamId, (id) => {
	if (id != null) {
		focusResultsSection();
	}
});

watch(rosterLoading, (loading, wasLoading) => {
	if (!loading && wasLoading && selectedTeamId.value != null) {
		focusResultsSection();
	}
});

function doubleRaf() {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(resolve);
		});
	});
}

/** Synchronous top scroll — avoids `scroll-behavior: smooth` on ancestors delaying the deal */
function scrollElementTopInstant(el, marginTop = 10) {
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
 * Focus results (a11y) and optionally scroll them into view.
 * @param {{ instantScroll?: boolean, skipScroll?: boolean }} [opts]
 * - `skipScroll`: no scroll — use before measuring deal vectors so the viewport (and album) stay put
 * - `instantScroll`: align section top to viewport (avoid on pack→cards handoff — it repositions the whole album)
 */
function prepareResultsForDealMeasure(opts = {}) {
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

	const wrappers = root.querySelectorAll('.album__card-deal');
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
	const rowBucket = (top) => Math.round(top / 40);
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
		const twistJitter = ((orderIndex * 13) % 9 - 4) * 0.55;
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

async function continueDealAfterPackOpen(runId) {
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

function onPackUnwrapComplete(runId) {
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
		if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
	{ flush: 'post' }
);

function loadPlayers(nextPlayers) {
	players.value = nextPlayers;
}

function loadTeam(team) {
	selectedTeamId.value = team.id;
	theme.value = team.teamCode?.toLowerCase() || '';
	teamName.value = team.name;
}

function setLiveMessage(message) {
	liveRegionText.value = message;
}

function setRosterLoadStage(stage) {
	rosterLoadStage.value = stage;
}

function setRosterLoading(loading) {
	rosterLoading.value = loading;
	if (!loading) {
		rosterLoadStage.value = 'idle';
	}
}

onMounted(() => {
	teams.value = [];
	teamsLoading.value = true;
	teamsError.value = '';
	liveRegionText.value = 'Opening the league sheet.';
	http.get('teams')
		.then((response) => {
			const data = filterMajorLeagueBaseballTeams(response.data.teams || []).sort(
				(a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' })
			);
			teams.value = data;
			teamsError.value = '';
			liveRegionText.value =
				data.length > 0
					? `${data.length} clubs on file. Pick one from the checklist to see the pasteboards.`
					: 'No teams available.';
		})
		.catch((err) => {
			console.error('teams request failed', err);
			teams.value = [];
			teamsError.value =
				'Could not load teams. Check your connection or try refreshing the page.';
		})
		.finally(() => {
			teamsLoading.value = false;
		});
});
</script>

<style>
/*
 * Typography: tokens.css — Newsreader (UI body), Oswald (chrome labels), Bebas Neue (display h1/h2),
 * Archivo (cards / pasteboard type).
 * Motion: pack unwrap + card deal only; masthead / chrome / roster stay static (print + broadcast).
 */
html {
	box-sizing: border-box;
}

*,
*::before,
*::after {
	box-sizing: inherit;
}

body {
	color: var(--color-text);
	margin: 0;
	min-height: 100vh;
	background-color: var(--color-surface);
	/* Day game: sunlit bleachers — sky wash, halftone + horizontal grain (softer than a UI dot grid) */
	background-image:
		radial-gradient(rgba(72, 58, 42, 0.03) 0.55px, transparent 0.65px),
		var(--app-body-fiber-a),
		var(--app-body-fiber-b),
		repeating-linear-gradient(
			180deg,
			transparent 0,
			transparent 5px,
			rgba(92, 62, 44, 0.045) 5px,
			rgba(92, 62, 44, 0.045) 6px
		),
		radial-gradient(ellipse 115% 75% at 50% -8%, rgba(120, 145, 195, 0.14), transparent 58%),
		radial-gradient(ellipse 100% 55% at 50% 105%, rgba(210, 165, 118, 0.1), transparent 52%);
	background-position:
		0 0,
		0 0,
		0 0,
		0 0,
		0 0,
		0 0;
	background-size:
		13px 13px,
		100% 100%,
		100% 100%,
		100% 100%,
		100% 100%,
		100% 100%;
}

@media (prefers-color-scheme: dark) {
	body {
		/* Night game: cool stadium-sky wash + warmer infield glow */
		background-image:
			radial-gradient(rgba(255, 255, 255, 0.028) 0.5px, transparent 0.62px),
			var(--app-body-fiber-a),
			var(--app-body-fiber-b),
			repeating-linear-gradient(
				180deg,
				transparent 0,
				transparent 6px,
				rgba(0, 0, 0, 0.12) 6px,
				rgba(0, 0, 0, 0.12) 7px
			),
			radial-gradient(ellipse 110% 65% at 50% -12%, rgba(100, 140, 200, 0.1), transparent 55%),
			radial-gradient(ellipse 95% 50% at 50% 108%, rgba(120, 85, 55, 0.12), transparent 48%);
		background-position:
			0 0,
			0 0,
			0 0,
			0 0,
			0 0,
			0 0;
		background-size:
			12px 12px,
			100% 100%,
			100% 100%,
			100% 100%,
			100% 100%,
			100% 100%;
	}
}
</style>

<style scoped>
#app {
	font-family: var(--font-ui);
	margin: 0 auto;
	max-width: 1280px;
	padding-bottom: calc(clamp(3rem, 10vw, 5rem) + env(safe-area-inset-bottom, 0px));
	padding-left: calc(clamp(1rem, 5vw, 2.25rem) + env(safe-area-inset-left, 0px));
	padding-right: calc(clamp(1rem, 5vw, 2.25rem) + env(safe-area-inset-right, 0px));
	padding-top: calc(clamp(1.25rem, 4vw, 2rem) + env(safe-area-inset-top, 0px));
}

.visually-hidden {
	border: 0;
	clip: rect(0, 0, 0, 0);
	height: 1px;
	margin: -1px;
	overflow: hidden;
	padding: 0;
	position: absolute;
	white-space: nowrap;
	width: 1px;
}

.app__banner {
	border: 2px solid var(--color-ui-ink);
	border-radius: 0;
	box-shadow: 3px 3px 0 var(--color-ui-crimson);
	margin: 0 auto var(--space-5);
	max-width: 800px;
	padding: var(--space-4) var(--space-5);
	text-align: center;
	width: 90%;
}

.app__banner--error {
	background: var(--color-danger-bg);
	border: 1px solid var(--color-danger-border);
	color: var(--color-danger-text);
}

.app__main {
	margin: 0 auto;
	max-width: 1200px;
	padding-bottom: clamp(1.5rem, 4vw, 2.5rem);
	width: 100%;
}

.app__shell {
	align-items: stretch;
	display: grid;
	gap: 0;
	grid-template-columns: minmax(0, 1fr);
	margin: 0 auto;
	max-width: 1200px;
	width: 100%;
}

.app__rail--paper {
	background: var(--album-rail-paper);
	padding: clamp(0.75rem, 2.2vw, 1.35rem);
	padding-left: calc(clamp(0.75rem, 2.2vw, 1.35rem) + 14px);
	position: relative;
}

/* Coarser halftone than body (13px) — newsprint on the checklist rail only. */
.app__rail--paper::before {
	background-image: radial-gradient(
		rgba(72, 58, 42, 0.052) 0.68px,
		transparent 0.84px
	);
	background-size: 17px 17px;
	content: '';
	inset: 0;
	pointer-events: none;
	position: absolute;
	z-index: 0;
}

@media (prefers-color-scheme: dark) {
	.app__rail--paper::before {
		background-image: radial-gradient(
			rgba(255, 252, 246, 0.055) 0.58px,
			transparent 0.78px
		);
		background-size: 16px 16px;
	}
}

/* Letterpress margin line — echoes binder margin (folio sits past this lane). */
.app__rail--paper::after {
	background: linear-gradient(
		to bottom,
		transparent,
		var(--album-checklist-margin-line) 5%,
		var(--album-checklist-margin-line) 95%,
		transparent
	);
	bottom: clamp(0.75rem, 2.2vw, 1.35rem);
	content: '';
	left: clamp(0.75rem, 2.2vw, 1.35rem);
	opacity: 0.88;
	pointer-events: none;
	position: absolute;
	top: clamp(0.75rem, 2.2vw, 1.35rem);
	width: 1px;
	z-index: 1;
}

.app__rail--felt {
	background-color: var(--album-felt-base);
	background-image: var(--album-felt-texture), var(--album-felt-overlay);
	padding: clamp(0.75rem, 2.2vw, 1.35rem);
	position: relative;
}

/* Spread folios — facing “pages” of the program (decorative). */
.app__folio {
	color: var(--color-text-muted);
	font-family: var(--font-ui-heading);
	font-size: 0.5625rem;
	font-weight: 600;
	letter-spacing: 0.24em;
	line-height: 1;
	opacity: 0.55;
	pointer-events: none;
	position: absolute;
	user-select: none;
	z-index: 1;
}

.app__folio--checklist {
	bottom: 0.4rem;
	left: calc(clamp(0.75rem, 2.2vw, 1.35rem) + 18px);
}

.app__folio--cards {
	bottom: 0.4rem;
	right: clamp(0.75rem, 2.2vw, 1.35rem);
}

@media (prefers-color-scheme: dark) {
	.app__folio {
		opacity: 0.45;
	}
}

/* Split only when there is room for a checklist column + cards; below this, full-width picker */
@media (min-width: 1180px) {
	.app__shell {
		/* Wider checklist rail so AL|NL split + chips stay legible (was capped 420px). */
		grid-template-columns: minmax(300px, min(42vw, 500px)) minmax(0, 1fr);
		min-height: min(calc(100vh - 9rem), 56rem);
	}

	.app__rail--paper {
		border-right: 1px solid var(--album-rail-paper-edge);
	}

	/* Sidebar rail: two wide columns — viewport-based 3–5 col rules do not apply here */
	.app__rail--paper .teams__container {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	/* Row chip layout in narrow rail (same idea as Team.vue small screens) */
	.app__rail--paper :deep(.team) {
		font-size: 0.75rem;
		justify-content: flex-start;
		min-height: 2.75rem;
		padding: var(--space-3) 0.5rem;
		text-align: left;
	}

	.app__rail--paper :deep(.team__inner) {
		flex-direction: row;
		gap: var(--space-2);
		justify-content: flex-start;
	}

	.app__rail--paper :deep(.team__logo) {
		box-shadow: 0 0 0 1px var(--theme-logo-border, var(--color-team-button-border));
		height: 26px;
		width: 26px;
	}

	.app__rail--paper :deep(.team__logo::before) {
		transform: translate(-50%, -50%) scale(calc(26 / 30));
	}

	/* AL | NL — tabloid columns + vertical rule (navy second ink). */
	.app__rail--paper .teams__sections--duo {
		align-items: start;
		display: grid;
		gap: 0 var(--space-5);
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}

	.app__rail--paper .teams__sections--duo .teams__section + .teams__section {
		border-left: 1px solid var(--album-league-rule);
		border-top: none;
		box-shadow: none;
		margin-top: 0;
		padding-left: var(--space-5);
		padding-top: 0;
	}

	/* Duo: one chip column per league half — avoids ~95px-wide cells with a 2×2 grid. */
	.app__rail--paper .teams__sections--duo .teams__container {
		grid-template-columns: minmax(0, 1fr);
	}
}

@media (max-width: 1179px) {
	.app__rail--paper {
		border-bottom: 3px double var(--color-ui-ink);
		box-shadow: 0 5px 0 0 var(--album-masthead-accent);
	}
}

.album__binder {
	background-color: var(--album-binder-page);
	background-image: var(--album-binder-depth);
	background-repeat: no-repeat, no-repeat, repeat;
	background-size: auto, auto, 4.5px 4.5px;
	border: 1px solid var(--color-border-medium);
	box-shadow:
		-8px 0 18px -10px rgba(0, 0, 0, 0.18),
		4px 12px 0 rgba(28, 25, 23, 0.07);
	max-width: 100%;
	padding: clamp(1.25rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2rem)
		clamp(2.35rem, 4.5vw, 2.85rem);
	position: relative;
	/* Parallax off — static print; settle keyframes only touch shadow (see useBinderPennantParallax.ts). */
	backface-visibility: hidden;
	transform: translate3d(0, var(--binder-parallax-y, 0px), 0.01px);
}

.album__binder::before {
	background-image: radial-gradient(
		circle at 50% 11px,
		var(--album-binder-hole) 0 4px,
		transparent 5px
	);
	background-repeat: repeat-y;
	background-size: 14px 46px;
	bottom: clamp(1.5rem, 4vw, 2.25rem);
	content: '';
	left: 14px;
	pointer-events: none;
	position: absolute;
	top: clamp(1.5rem, 4vw, 2.25rem);
	width: 14px;
}

.album__binder::after {
	background: linear-gradient(
		to bottom,
		transparent,
		var(--album-binder-margin-line) 6%,
		var(--album-binder-margin-line) 94%,
		transparent
	);
	bottom: clamp(1.15rem, 3vw, 1.85rem);
	content: '';
	left: 38px;
	opacity: 0.88;
	pointer-events: none;
	position: absolute;
	top: clamp(1.15rem, 3vw, 1.85rem);
	width: 1px;
}

@media (prefers-color-scheme: dark) {
	.album__binder {
		box-shadow:
			-8px 0 22px -10px rgba(0, 0, 0, 0.55),
			4px 12px 0 rgba(0, 0, 0, 0.35);
	}
}

.album__binder--settle {
	animation: album-binder-settle 0.38s cubic-bezier(0.34, 1, 0.36, 1) both;
}

/* Shadow only — `translateY` on the whole binder read as the album/cards “jumping” vertically */
@keyframes album-binder-settle {
	0% {
		box-shadow:
			-8px 0 26px -12px rgba(0, 0, 0, 0.12),
			4px 18px 0 rgba(28, 25, 23, 0.045);
	}

	100% {
		box-shadow:
			-8px 0 18px -10px rgba(0, 0, 0, 0.18),
			4px 12px 0 rgba(28, 25, 23, 0.07);
	}
}

@media (prefers-color-scheme: dark) {
	.album__binder--settle {
		animation: album-binder-settle-dark 0.38s cubic-bezier(0.34, 1, 0.36, 1) both;
	}
}

@keyframes album-binder-settle-dark {
	0% {
		box-shadow:
			-8px 0 28px -12px rgba(0, 0, 0, 0.42),
			4px 18px 0 rgba(0, 0, 0, 0.28);
	}

	100% {
		box-shadow:
			-8px 0 22px -10px rgba(0, 0, 0, 0.55),
			4px 12px 0 rgba(0, 0, 0, 0.35);
	}
}

@media (prefers-reduced-motion: reduce) {
	.album__binder--settle {
		animation: album-binder-settle-rm 0.22s ease both;
	}
}

@keyframes album-binder-settle-rm {
	0% {
		opacity: 0.9;
	}

	100% {
		opacity: 1;
	}
}

.app__rail--paper .album__search--picker {
	margin-inline: 0;
	max-width: 100%;
}

.album__status {
	margin: 0 auto var(--space-4);
	max-width: 800px;
	text-align: center;
	width: 70%;
}

.album__results-status {
	align-items: center;
	color: var(--color-text-muted);
	display: flex;
	grid-column: 1 / -1;
	justify-content: center;
	justify-self: stretch;
	margin: 0;
	text-align: center;
	width: 100%;
}

.album__loading-row {
	align-items: baseline;
	display: inline-flex;
	flex-wrap: wrap;
	gap: 0.35rem 0.5rem;
	justify-content: center;
}

.album__loading-copy {
	font-family: var(--font-ui-heading);
	font-size: 0.8125rem;
	font-weight: 600;
	letter-spacing: 0.14em;
	text-transform: uppercase;
}

/* Typewriter caret — static (motion budget goes to pack deal only). */
.album__type-caret {
	animation: none;
	background: currentColor;
	display: inline-block;
	height: 0.72em;
	margin-left: 1px;
	opacity: 0.85;
	transform: translateY(0.06em);
	vertical-align: -0.05em;
	width: 2px;
}

/* Letterpress “printing” dots */
.album__print-dots {
	display: inline-flex;
	gap: 0.28rem;
}

.album__print-dot {
	animation: none;
	background: currentColor;
	border-radius: 50%;
	height: 4px;
	opacity: 0.45;
	width: 4px;
}

.album__print-dot:nth-child(2) {
	opacity: 0.48;
}

.album__print-dot:nth-child(3) {
	opacity: 0.42;
}

@media (prefers-reduced-motion: reduce) {
	.album__type-caret {
		animation: none;
		opacity: 0.75;
	}

	.album__print-dot {
		animation: none;
		opacity: 0.55;
	}

	.album__print-dot:nth-child(2),
	.album__print-dot:nth-child(3) {
		opacity: 0.4;
	}
}

.album__results-placeholder,
.album__results-empty {
	color: var(--color-text-muted);
	grid-column: 1 / -1;
	justify-self: stretch;
	margin: 0;
	text-align: center;
	width: 100%;
}

.teams__nav {
	background: var(--color-surface-nav);
	border-bottom: 3px solid var(--color-ui-ink);
	box-shadow:
		0 4px 0 0 var(--color-ui-crimson),
		inset 0 1px 0 0 rgba(250, 244, 232, 0.42);
	padding-block: var(--space-4) var(--space-5);
	position: sticky;
	top: env(safe-area-inset-top, 0px);
	width: 100%;
	z-index: 10;
}

@media (prefers-color-scheme: dark) {
	.teams__nav {
		box-shadow:
			0 4px 0 0 var(--color-ui-crimson),
			inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
	}
}

h1,
h2 {
	font-family: var(--font-ui-display);
	font-weight: 400;
	text-align: center;
}

.app__title {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1.25rem;
	justify-content: center;
	margin: 0 auto clamp(1.25rem, 4vw, 2rem);
	max-width: 1100px;
	width: 100%;
}

.app__title--masthead {
	border-bottom: 4px solid var(--color-ui-ink);
	box-shadow:
		inset 0 -1px 0 0 var(--color-ui-crimson),
		inset 0 -2px 0 0 color-mix(in srgb, var(--color-ui-gum) 55%, transparent),
		0 4px 0 0 var(--album-masthead-accent);
	isolation: isolate;
	margin-bottom: clamp(1rem, 3vw, 1.5rem);
	max-width: none;
	padding-bottom: clamp(1rem, 3vw, 1.35rem);
	padding-top: clamp(0.65rem, 2vw, 1rem);
	perspective: 820px;
	position: relative;
}

@supports not (color: color-mix(in srgb, red 1%, blue 1%)) {
	.app__title--masthead {
		box-shadow:
			inset 0 -1px 0 0 var(--color-ui-crimson),
			inset 0 -2px 0 0 rgba(30, 58, 95, 0.45),
			0 4px 0 0 var(--album-masthead-accent);
	}
}

/* Cream band: stock + fleck + halftone (stronger at edges — center wash keeps type clean). */
.app__title--masthead::before {
	animation: none;
	background-color: var(--album-masthead-bg);
	background-image:
		radial-gradient(ellipse 74% 70% at 50% 44%, rgba(247, 240, 226, 0.88) 0%, transparent 58%),
		radial-gradient(rgba(58, 42, 30, 0.072) 0.42px, transparent 0.52px),
		repeating-radial-gradient(
			circle at 1.1px 1.4px,
			rgba(28, 25, 23, 0.034) 0 0.35px,
			transparent 0.75px
		);
	background-size:
		100% 100%,
		11px 11px,
		100% 100%;
	content: '';
	inset: 0;
	opacity: 1;
	pointer-events: none;
	position: absolute;
	z-index: 0;
}

@media (prefers-color-scheme: dark) {
	.app__title--masthead::before {
		background-image:
			radial-gradient(ellipse 74% 70% at 50% 44%, rgba(38, 35, 32, 0.55) 0%, transparent 58%),
			radial-gradient(rgba(255, 252, 246, 0.05) 0.4px, transparent 0.52px),
			repeating-radial-gradient(
				circle at 1.1px 1.4px,
				rgba(0, 0, 0, 0.14) 0 0.35px,
				transparent 0.75px
			);
	}
}

/* Heavier tube vignette on the band only (early CRT / broadcast booth). */
.app__title--masthead::after {
	background:
		radial-gradient(ellipse 88% 92% at 50% 42%, transparent 0%, transparent 42%, rgba(28, 25, 23, 0.07) 100%),
		radial-gradient(ellipse 102% 88% at 50% 50%, transparent 55%, rgba(15, 23, 42, 0.1) 100%);
	content: '';
	inset: 0;
	mix-blend-mode: multiply;
	opacity: 0.92;
	pointer-events: none;
	position: absolute;
	z-index: 1;
}

@media (prefers-color-scheme: dark) {
	.app__title--masthead::after {
		background:
			radial-gradient(ellipse 88% 92% at 50% 42%, transparent 0%, transparent 42%, rgba(0, 0, 0, 0.35) 100%),
			radial-gradient(ellipse 102% 88% at 50% 50%, transparent 52%, rgba(0, 0, 0, 0.45) 100%);
		mix-blend-mode: normal;
		opacity: 0.55;
	}

	.app__title--masthead {
		box-shadow:
			inset 0 -1px 0 0 var(--color-ui-crimson),
			inset 0 -2px 0 0 rgba(147, 197, 253, 0.32),
			0 4px 0 0 var(--album-masthead-accent);
	}
}

.app__title-tv-safe {
	animation: masthead-tv-safe-snap 0.22s cubic-bezier(0.34, 1, 0.36, 1) 0.04s both;
	border: 1px solid rgba(15, 23, 42, 0.14);
	border-radius: 3px;
	box-shadow:
		inset 0 1px 0 rgba(252, 246, 234, 0.72),
		inset 0 0 0 1px rgba(250, 244, 232, 0.35),
		inset 0 0 0 3px rgba(15, 23, 42, 0.06),
		inset 0 10px 28px -8px rgba(28, 25, 23, 0.05),
		0 2px 0 rgba(28, 25, 23, 0.1),
		0 12px 28px -10px rgba(28, 25, 23, 0.14);
	box-sizing: border-box;
	color: var(--color-ui-ink);
	margin-inline: auto;
	max-width: min(40rem, 94vw);
	padding: clamp(0.65rem, 2.2vw, 1.1rem) clamp(1rem, 3.5vw, 2rem) clamp(0.75rem, 2.5vw, 1.15rem);
	position: relative;
	transform: rotateX(0.7deg);
	transform-origin: 50% 40%;
	z-index: 2;
}

@keyframes masthead-tv-safe-snap {
	0% {
		opacity: 0.9;
		transform: rotateX(0.88deg) translateY(5px);
	}

	100% {
		opacity: 1;
		transform: rotateX(0.7deg) translateY(0);
	}
}

/* Small registration corners — print shop (smaller than picker crop marks). */
.app__title-tv-safe::before {
	background:
		linear-gradient(currentColor, currentColor) 0 0 / 6px 1px no-repeat,
		linear-gradient(currentColor, currentColor) 0 0 / 1px 6px no-repeat,
		linear-gradient(currentColor, currentColor) 100% 0 / 6px 1px no-repeat,
		linear-gradient(currentColor, currentColor) calc(100% - 1px) 0 / 1px 6px no-repeat,
		linear-gradient(currentColor, currentColor) 0 100% / 6px 1px no-repeat,
		linear-gradient(currentColor, currentColor) 0 calc(100% - 1px) / 1px 6px no-repeat,
		linear-gradient(currentColor, currentColor) 100% 100% / 6px 1px no-repeat,
		linear-gradient(currentColor, currentColor) 100% calc(100% - 1px) / 1px 6px no-repeat;
	color: var(--color-ui-ink);
	content: '';
	inset: 0.28rem;
	opacity: 0.38;
	pointer-events: none;
	position: absolute;
	z-index: 0;
}

.app__title-tv-safe > * {
	position: relative;
	z-index: 1;
}

@media (prefers-color-scheme: dark) {
	.app__title-tv-safe {
		border-color: rgba(231, 229, 228, 0.14);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.08),
			inset 0 0 0 1px rgba(0, 0, 0, 0.2),
			inset 0 0 0 3px rgba(255, 255, 255, 0.04),
			inset 0 10px 28px -8px rgba(0, 0, 0, 0.22),
			0 2px 0 rgba(0, 0, 0, 0.35),
			0 12px 28px -10px rgba(0, 0, 0, 0.45);
	}

	.app__title-tv-safe::before {
		opacity: 0.28;
	}
}

.app__title-woodcut {
	animation: masthead-woodcut-snap 0.2s cubic-bezier(0.34, 1, 0.36, 1) 0.02s both;
	color: var(--color-ui-ink);
	line-height: 0;
	margin: 0 auto 0.45rem;
	max-width: 6rem;
	opacity: 0.98;
	width: clamp(3.75rem, 16vw, 5.5rem);
}

@keyframes masthead-woodcut-snap {
	0% {
		opacity: 0.52;
		transform: translateY(5px);
	}

	100% {
		opacity: 0.98;
		transform: translateY(0);
	}
}

.app__title-woodcut__tick {
	fill: var(--color-ui-crimson);
	opacity: 0.92;
}

.app__title-woodcut__svg {
	display: block;
	height: auto;
	width: 100%;
}

.app__title--masthead > .app__title-tv-safe {
	width: 100%;
}

@media (prefers-reduced-motion: reduce) {
	.app__title-tv-safe,
	.app__title-woodcut {
		animation: none !important;
	}

	.app__title-tv-safe {
		opacity: 1;
		transform: none;
	}

	.app__title-woodcut {
		opacity: 0.98;
		transform: none;
	}

	.app__title--masthead::after {
		opacity: 0.4;
	}
}

.app__title-kicker-wrap {
	box-sizing: border-box;
	display: inline-block;
	margin: 0 auto 0.5rem;
	max-width: 100%;
	padding: 0.28rem 1.15rem 0.32rem;
	position: relative;
	width: fit-content;
}

.app__title-kicker-wrap::before {
	background: linear-gradient(
		175deg,
		var(--album-roster-pennant-a) 0%,
		var(--album-roster-pennant-b) 100%
	);
	box-shadow:
		inset 0 1px 0 rgba(252, 246, 234, 0.4),
		inset 0 -1px 0 rgba(28, 25, 23, 0.08);
	clip-path: polygon(5% 0, 95% 0, 100% 100%, 0 100%);
	content: '';
	inset: 0;
	pointer-events: none;
	position: absolute;
	z-index: 0;
}

.app__title-kicker {
	color: var(--color-ui-ink);
	font-family: var(--font-ui-display);
	font-size: clamp(0.625rem, 1.5vw, 0.75rem);
	font-weight: 400;
	letter-spacing: 0.28em;
	line-height: 1.3;
	margin: 0;
	position: relative;
	text-transform: uppercase;
	z-index: 1;
}

@media (prefers-color-scheme: dark) {
	.app__title-kicker {
		color: var(--color-text);
	}
}

.app__title-text {
	align-items: center;
	display: flex;
	flex: 1 1 100%;
	flex-direction: column;
	text-align: center;
}

.app__title-subtitle {
	color: var(--color-text-muted);
	font-family: var(--font-ui);
	font-size: clamp(0.8125rem, 2vw, 0.9375rem);
	font-weight: 500;
	font-style: italic;
	letter-spacing: 0.02em;
	line-height: 1.55;
	margin: 0.5rem auto 0;
	max-width: 38em;
	text-transform: none;
}

.album__search {
	margin: 0 auto;
	max-width: 800px;
}

.album__search--picker {
	max-width: min(56rem, 100%);
}

/* Registration corners — print shop frame around wax strip + form. */
.teams__picker-print-frame {
	box-sizing: border-box;
	color: var(--color-ui-ink);
	margin-inline: auto;
	max-width: min(56rem, 100%);
	padding: 0.42rem 0.48rem 0.55rem;
	position: relative;
	width: 100%;
}

.teams__picker-print-frame::before {
	background:
		linear-gradient(currentColor, currentColor) 2px 2px / 10px 1px no-repeat,
		linear-gradient(currentColor, currentColor) 2px 2px / 1px 10px no-repeat,
		linear-gradient(currentColor, currentColor) calc(100% - 2px) 2px / 10px 1px no-repeat,
		linear-gradient(currentColor, currentColor) calc(100% - 3px) 2px / 1px 10px no-repeat,
		linear-gradient(currentColor, currentColor) 2px calc(100% - 2px) / 10px 1px no-repeat,
		linear-gradient(currentColor, currentColor) 2px calc(100% - 3px) / 1px 10px no-repeat,
		linear-gradient(currentColor, currentColor) calc(100% - 2px) calc(100% - 2px) / 10px 1px no-repeat,
		linear-gradient(currentColor, currentColor) calc(100% - 3px) calc(100% - 3px) / 1px 10px no-repeat;
	content: '';
	inset: 0;
	opacity: 0.48;
	pointer-events: none;
	position: absolute;
	z-index: 2;
}

@media (prefers-color-scheme: dark) {
	.teams__picker-print-frame::before {
		opacity: 0.34;
	}
}

.teams__picker-panel {
	--teams-pack-strip-h: 0.875rem;
	background: var(--color-surface-elevated);
	border: 2px solid var(--color-ui-ink);
	box-shadow: 4px 4px 0 rgba(28, 25, 23, 0.08);
	max-width: 100%;
	padding:
		calc(var(--teams-pack-strip-h) + clamp(var(--space-4), 2.5vw, var(--space-6)))
		clamp(var(--space-4), 2.5vw, var(--space-6))
		calc(clamp(var(--space-4), 2.5vw, var(--space-6)) + 0.65rem)
		clamp(var(--space-4), 2.5vw, var(--space-6));
	position: relative;
	width: 100%;
	z-index: 0;
}

/* Stub tear — perforated bottom edge (ticket / counter sheet). */
.teams__picker-panel::after {
	border-bottom: 1px dashed var(--teams-pack-strip-perf);
	bottom: clamp(var(--space-3), 2vw, var(--space-4));
	content: '';
	left: clamp(var(--space-4), 2.5vw, var(--space-6));
	opacity: 0.88;
	pointer-events: none;
	position: absolute;
	right: clamp(var(--space-4), 2.5vw, var(--space-6));
	z-index: 1;
}

/* Wax-pack tear strip: colored rule + dashed “perforation” (merch counter, not a bare form). */
.teams__picker-panel::before {
	animation: none;
	background:
		linear-gradient(
			102deg,
			transparent 0%,
			rgba(255, 250, 242, 0.2) 40%,
			rgba(255, 250, 242, 0.06) 50%,
			transparent 62%
		),
		linear-gradient(180deg, var(--teams-pack-strip-bg-a) 0%, var(--teams-pack-strip-bg-b) 100%);
	background-size: 100% 100%, 100% 100%;
	border-bottom: 1px dashed var(--teams-pack-strip-perf);
	border-top: 2px solid var(--teams-pack-strip-rule);
	box-sizing: border-box;
	content: '';
	height: var(--teams-pack-strip-h);
	left: 0;
	pointer-events: none;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 0;
}

.teams__picker-merch {
	align-items: center;
	display: flex;
	height: var(--teams-pack-strip-h);
	justify-content: space-between;
	left: 0;
	padding-inline: 0.4rem;
	pointer-events: none;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 1;
}

.teams__picker-merch-star {
	color: var(--teams-pack-strip-rule);
	font-size: 0.5rem;
	line-height: 1;
	opacity: 0.55;
	text-shadow: 0 1px 0 rgba(250, 244, 232, 0.38);
}

@media (prefers-color-scheme: dark) {
	.teams__picker-panel {
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.35);
	}

	.teams__picker-panel::before {
		background:
			linear-gradient(
				102deg,
				transparent 0%,
				rgba(255, 255, 255, 0.09) 42%,
				rgba(255, 255, 255, 0.03) 50%,
				transparent 60%
			),
			linear-gradient(180deg, var(--teams-pack-strip-bg-a) 0%, var(--teams-pack-strip-bg-b) 100%);
		background-size: 100% 100%, 100% 100%;
	}

	.teams__picker-merch-star {
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
	}
}

.teams__sections {
	width: 100%;
}

/* 3+ league buckets: horizontal program rules (stacked sheet). */
.teams__sections--multi .teams__section + .teams__section {
	border-top: 2px solid rgba(185, 28, 28, 0.28);
	box-shadow: 0 -1px 0 0 rgba(15, 23, 42, 0.1);
	margin-top: var(--space-6);
	padding-top: var(--space-5);
}

/* Team chips: slight “stamp” tilt + nudge (loose cards on a counter); reduced motion = no tilt. */
:deep(.teams__container .team) {
	position: relative;
	transition:
		box-shadow 0.2s ease,
		background-color 0.2s ease,
		border-color 0.2s ease;
	z-index: 0;
}

:deep(.teams__container .team:nth-child(7n + 1)),
:deep(.teams__container .team:nth-child(7n + 2)),
:deep(.teams__container .team:nth-child(7n + 3)),
:deep(.teams__container .team:nth-child(7n + 4)),
:deep(.teams__container .team:nth-child(7n + 5)),
:deep(.teams__container .team:nth-child(7n + 6)),
:deep(.teams__container .team:nth-child(7n + 7)) {
	transform: none;
}

:deep(.teams__container .team:focus-visible) {
	z-index: 4;
}

@media (prefers-reduced-motion: reduce) {
	:deep(.teams__container .team) {
		transform: none !important;
		transition-duration: 0.01ms !important;
	}
}

.teams__picker-head {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	margin-bottom: var(--space-5);
	max-width: 28rem;
	width: 100%;
}

.teams__search-label {
	color: var(--color-text-muted);
	font-family: var(--font-ui-heading);
	font-size: 0.8125rem;
	font-weight: 600;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.teams__search-input {
	-webkit-appearance: none;
	appearance: none;
	background: var(--color-surface);
	border: 2px solid var(--color-ui-ink);
	color: var(--color-text);
	font-family: var(--font-ui);
	font-size: 1rem;
	line-height: 1.35;
	min-height: 2.75rem;
	padding: 0.5rem 0.75rem;
	width: 100%;
}

.teams__search-input::placeholder {
	color: var(--color-text-muted);
	opacity: 1;
}

.teams__search-input:disabled {
	cursor: not-allowed;
	opacity: 0.55;
}

.teams__search-input:focus {
	outline: none;
}

.teams__search-input:focus-visible {
	box-shadow:
		0 0 0 3px var(--color-focus-ring),
		0 0 0 5px var(--color-ui-gum);
}

.teams__search-empty {
	color: var(--color-text-muted);
	font-size: 0.9375rem;
	margin: 0 0 var(--space-4);
	text-align: center;
}

.teams__section + .teams__section {
	margin-top: var(--space-6);
}

/* Duo (narrow): keep stacked spacing; wide rail uses grid in 1180px block. */
.teams__sections--duo .teams__section + .teams__section {
	border-top: none;
	box-shadow: none;
}

.teams__section-title {
	border-bottom: 2px solid var(--color-ui-crimson);
	color: var(--color-ui-ink);
	font-family: var(--font-ui-display);
	font-size: clamp(0.9375rem, 2.2vw, 1.125rem);
	font-variant-numeric: tabular-nums;
	font-weight: 400;
	letter-spacing: 0.16em;
	margin: 0 0 var(--space-4);
	padding-bottom: var(--space-2);
	text-align: left;
	text-transform: uppercase;
}

@media (prefers-color-scheme: dark) {
	.teams__section-title {
		color: var(--color-text);
	}
}

.album__search--title {
	font-size: clamp(1.85rem, 5vw, 2.75rem);
	font-weight: 400;
	letter-spacing: 0.06em;
	line-height: 1.12;
	margin: 0;
	text-transform: uppercase;
}

/* Masthead H1: ink lift + crimson rule + thin underline (spot color “pop”). */
.app__title--masthead .album__search--title {
	position: relative;
	text-shadow:
		0 1px 0 rgba(250, 244, 232, 0.35),
		0 2px 1px rgba(28, 25, 23, 0.12);
}

.app__title--masthead .album__search--title::after {
	background: linear-gradient(
		90deg,
		transparent,
		var(--color-ui-crimson) 18%,
		var(--color-ui-crimson) 82%,
		transparent
	);
	bottom: -0.12em;
	content: '';
	height: 2px;
	left: 50%;
	max-width: 12rem;
	opacity: 0.88;
	position: absolute;
	transform: translateX(-50%);
	width: min(72%, 12rem);
}

.teams__container {
	align-items: stretch;
	display: grid;
	gap: var(--space-2);
	grid-template-columns: repeat(3, minmax(0, 1fr));
	width: 100%;
}

@media (min-width: 1280px) {
	.teams__container {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}

@media (min-width: 1440px) {
	.teams__container {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}
}

@media (max-width: 480px) {
	.teams__container {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 340px) {
	.teams__container {
		grid-template-columns: minmax(0, 1fr);
	}
}

.album__results,
.album__results-cards-region,
.album__results-stack {
	display: grid;
	gap: clamp(1rem, 3vw, 1.5rem);
	grid-template-columns: minmax(0, 1fr);
	justify-items: center;
}

.album__results {
	border-top: none;
	margin: 0;
	max-width: none;
	padding-top: clamp(0.25rem, 1.5vw, 0.5rem);
	/* Sticky team bar on narrow viewports: keep focused cards below the fold */
	scroll-margin-top: calc(0.75rem + min(28vh, 220px) + env(safe-area-inset-top, 0px));
}

.album__results-stack {
	margin: 0;
	min-width: 0;
	overflow: visible;
	/* One shared 3D scene — per-card `perspective()` was forcing expensive repaints on large rosters */
	perspective: min(1120px, 94vw);
	position: relative;
	transform-style: preserve-3d;
	width: 100%;
	z-index: 1;
}

/* Flatter perspective while the deal runs — less extreme 3D = smoother compositing */
.album__results-stack--deal-motion {
	perspective: min(2200px, 130vw);
}

/* Card grid + deck shadow; pack is absolutely positioned here so it never reserves a grid row */
.album__results-cards-region {
	grid-column: 1 / -1;
	margin: 0;
	min-width: 0;
	position: relative;
	width: 100%;
}

.album__results-main {
	grid-column: 1 / -1;
	position: relative;
	width: 100%;
}

.album__results-main--loading {
	min-height: clamp(16rem, 42vh, 28rem);
}

.album__skeleton-overlay {
	align-items: flex-start;
	display: flex;
	justify-content: center;
	inset: 0;
	padding-top: 0.35rem;
	pointer-events: none;
	position: absolute;
	z-index: 2;
}

.album__skeleton-block {
	display: grid;
	gap: clamp(1rem, 3vw, 1.5rem);
	grid-template-columns: minmax(0, 1fr);
	justify-items: center;
	margin: 0 auto;
	max-width: 40rem;
	width: 100%;
}

.album__skeleton-card {
	justify-self: center;
	max-width: 280px;
	width: 100%;
}

.album__skeleton-card-inner {
	aspect-ratio: 5 / 6;
	background:
		radial-gradient(rgba(40, 35, 30, 0.045) 0.55px, transparent 0.65px),
		linear-gradient(168deg, #dfd2be 0%, #cbbda8 48%, #d9cfba 100%);
	background-size: 7px 7px, 100% 100%;
	border: 1px solid var(--color-border-card);
	border-radius: 10px;
	box-shadow:
		0 1px 2px rgba(0, 0, 0, 0.05),
		inset 0 1px 0 rgba(250, 244, 232, 0.36);
}

@media (prefers-color-scheme: dark) {
	.album__skeleton-card-inner {
		background:
			radial-gradient(rgba(255, 255, 255, 0.05) 0.5px, transparent 0.62px),
			linear-gradient(168deg, #3a3734 0%, #2e2c29 50%, #343230 100%);
		border-color: rgba(255, 255, 255, 0.1);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}
}

.album-skel-fade-leave-active {
	transition: opacity 0.34s ease;
}

.album-skel-fade-leave-from {
	opacity: 1;
}

.album-skel-fade-leave-to {
	opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
	.album-skel-fade-leave-active {
		transition-duration: 0.08s;
	}
}

@media (min-width: 640px) {
	.album__results,
	.album__results-cards-region,
	.album__results-stack,
	.album__skeleton-block {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.album__skeleton-block {
		max-width: none;
	}
}

@media (min-width: 960px) {
	.album__results,
	.album__results-cards-region,
	.album__results-stack,
	.album__skeleton-block {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}

@media (min-width: 1180px) {
	.album__results {
		scroll-margin-top: calc(0.75rem + env(safe-area-inset-top, 0px));
	}
}

.album__results--many-cards {
	--shadow-card: var(--shadow-card-large-roster);
}

/*
 * Roster deal: few transform stops + ease-out. No translateZ (avoids extra layer thrash with
 * nested card 3D). Opacity ramp only — never animate filter: blur.
 */
@keyframes album-card-reveal {
	0% {
		filter: none;
		opacity: 0;
		transform: translate3d(var(--deal-from-x, 0px), var(--deal-from-y, 0px), 0)
			rotateY(calc(var(--deal-ry-start, 48deg) + var(--deal-ry-fan, 0deg)))
			rotateZ(calc(var(--deal-twist, 0deg) * 0.38 + var(--deal-rz-arc, 0deg)))
			scale3d(
				calc(0.84 * var(--deal-lead-boost, 1)),
				calc(0.84 * var(--deal-lead-boost, 1)),
				1
			);
	}

	11% {
		opacity: 1;
	}

	38% {
		transform: translate3d(calc(var(--deal-from-x, 0px) * 0.08), calc(var(--deal-from-y, 0px) * 0.08), 0)
			rotateY(calc((var(--deal-ry-start, 48deg) + var(--deal-ry-fan, 0deg)) * 0.32))
			rotateZ(calc(var(--deal-twist, 0deg) * 0.29 + var(--deal-rz-arc, 0deg) * 0.38))
			scale3d(0.95, 0.95, 1);
	}

	100% {
		filter: none;
		opacity: 1;
		transform: translate3d(0, 0, 0) rotateY(0deg)
			rotateZ(calc(var(--deal-twist, 0deg) * var(--deal-rest, 0.24)))
			scale3d(1, 1, 1);
	}
}

@keyframes album-deal-act3-cap-settle {
	0% {
		filter: blur(0) brightness(1);
	}

	40% {
		filter: blur(0) brightness(1.06) saturate(1.05);
	}

	100% {
		filter: blur(0) brightness(1);
	}
}

@keyframes album-deal-act1-pack-breathe {
	0% {
		transform: scale(0.96);
	}

	55% {
		transform: scale(1.045);
	}

	100% {
		transform: scale(1);
	}
}

.album__card-deal {
	--deal-lead-boost: 1;
	--deal-rest: 0.24;
	--deal-rz-arc: 0deg;
	justify-self: center;
	max-width: 280px;
	position: relative;
	/* Pivot from bottom edge so Y/Z rotation reads like fanning a deck */
	transform-origin: 50% 100%;
	transform-style: preserve-3d;
	width: 100%;
}

/* Out of grid flow — cards lay out from the top of `.album__results-cards-region` underneath */
.album__pack-stage {
	align-items: center;
	display: flex;
	inset-inline: 0;
	justify-content: center;
	overflow: visible;
	pointer-events: none;
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 8;
}

/* Act 1 — anticipation: subtle inhale/exhale before / during unwrap (Lottie still runs underneath) */
.album__pack-stage--deal-act1 {
	animation: album-deal-act1-pack-breathe 0.55s cubic-bezier(0.34, 1, 0.36, 1) 0.06s both;
	transform-origin: 50% 58%;
}

.album-pack-out-leave-active {
	transition:
		opacity 0.2s cubic-bezier(0.37, 0, 0.18, 1),
		transform 0.2s cubic-bezier(0.37, 0, 0.18, 1);
}

.album-pack-out-leave-from {
	opacity: 1;
	transform: translateZ(0);
}

.album-pack-out-leave-to {
	opacity: 0;
	transform: translateY(18px) scale(0.9) translateZ(0);
}

.album__card-deal--idle {
	filter: none;
	opacity: 0;
	pointer-events: none;
}

.album__card-deal--measuring {
	filter: none;
	opacity: 0;
	pointer-events: none;
}

/*
 * `forwards` only (no `backwards`): with `both`, delay time used 0% keyframe transform and cards
 * painted offset from their grid slots while invisible — read as “below viewport” then snapping in.
 * Pre-delay: opacity 0 + rest transform keeps each card in its slot until its stagger starts.
 */
.album__card-deal--animate {
	animation: album-card-reveal var(--deal-anim-duration, 1960ms) ease-out forwards;
	animation-delay: var(--deal-delay, 0ms);
	backface-visibility: hidden;
	filter: none;
	opacity: 0;
	transform: translate3d(0, 0, 0) rotateY(0deg)
		rotateZ(calc(var(--deal-twist, 0deg) * var(--deal-rest, 0.24)))
		scale3d(1, 1, 1);
	will-change: transform;
	z-index: calc(20 + min(var(--deal-layer, 0), 48));
}

/*
 * BaseballCard’s .card__tilt uses `transition: transform` — that fights the parent’s keyframed
 * transform every frame (nested transform transitions read as stutter). Kill during deal prep + peel.
 */
.album__card-deal--measuring :deep(.card__tilt),
.album__card-deal--measuring :deep(.card__container),
.album__card-deal--animate :deep(.card__tilt),
.album__card-deal--animate :deep(.card__container) {
	transition: none !important;
}

/* Act 3 — resolution: last card micro-settle (filter-only so it doesn’t fight the peel transform) */
.album__card-deal--animate[data-deal-act='cap'],
.album__card-deal--animate[data-deal-act='both'] {
	animation:
		album-card-reveal var(--deal-anim-duration, 1960ms) ease-out var(--deal-delay, 0ms)
			forwards,
		album-deal-act3-cap-settle 0.52s cubic-bezier(0.34, 1, 0.45, 1) var(--deal-cap-delay, 0ms) forwards;
}

/*
 * Large rosters (>30): shorter peel + cap settle; stagger / vectors / fan angles tightened in JS.
 */
.album__card-deal--many.album__card-deal--animate[data-deal-act='cap'],
.album__card-deal--many.album__card-deal--animate[data-deal-act='both'] {
	animation:
		album-card-reveal var(--deal-anim-duration, 1380ms) ease-out var(--deal-delay, 0ms)
			forwards,
		album-deal-act3-cap-settle 0.48s cubic-bezier(0.34, 1, 0.45, 1) var(--deal-cap-delay, 0ms) forwards;
}

.album__card-deal--static {
	filter: none;
	opacity: 1;
	/* Match album-card-reveal 100% exactly so removing `animation` does not snap */
	transform: translate3d(0, 0, 0) rotateY(0deg)
		rotateZ(calc(var(--deal-twist, 0deg) * var(--deal-rest, 0.24)))
		scale3d(1, 1, 1);
	will-change: auto;
	z-index: auto;
}

.album__card-deal--many.album__card-deal--animate {
	--deal-anim-duration: 1380ms;
	animation-timing-function: ease-out;
}

/*
 * One-shot “deck weight” pulse during pack unwrap — visible while `.album__deck-shadow` stays
 * `visibility:hidden` until the card deal (`ready`).
 */
.album__deck-anticipation {
	height: 0;
	inset-inline: 0;
	pointer-events: none;
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 6;
}

.album__deck-anticipation::before {
	animation: album-deck-anticipation-pulse 0.68s cubic-bezier(0.34, 1, 0.36, 1) 0.1s both;
	background: radial-gradient(
		ellipse 72% 100% at 50% 0%,
		rgba(28, 25, 23, 0.1) 0%,
		rgba(28, 25, 23, 0.04) 52%,
		transparent 78%
	);
	content: '';
	height: 2rem;
	left: 50%;
	position: absolute;
	top: 0;
	transform: translate(-50%, -28%);
	transform-origin: 50% 0%;
	width: min(96%, 56rem);
}

@media (prefers-color-scheme: dark) {
	.album__deck-anticipation::before {
		background: radial-gradient(
			ellipse 72% 100% at 50% 0%,
			rgba(0, 0, 0, 0.38) 0%,
			rgba(0, 0, 0, 0.12) 52%,
			transparent 78%
		);
	}
}

@keyframes album-deck-anticipation-pulse {
	0% {
		opacity: 0;
		transform: translate(-50%, -28%) scale(0.9);
	}

	42% {
		opacity: 1;
		transform: translate(-50%, -28%) scale(1.05);
	}

	100% {
		opacity: 0;
		transform: translate(-50%, -28%) scale(1);
	}
}

.album__deck-shadow {
	grid-column: 1 / -1;
	height: 0;
	margin-bottom: 0.2rem;
	pointer-events: none;
	position: relative;
	width: 100%;
	z-index: 1;
}

/* Keep this row in the grid when the shadow is off — removing the node dropped a grid gap and shifted cards up */
.album__deck-shadow--hidden {
	visibility: hidden;
}

.album__deck-shadow::before {
	background: radial-gradient(
		ellipse 72% 100% at 50% 0%,
		rgba(28, 25, 23, 0.07) 0%,
		rgba(28, 25, 23, 0.025) 52%,
		transparent 78%
	);
	content: '';
	height: 2rem;
	left: 50%;
	position: absolute;
	top: 0;
	transform: translate(-50%, -28%);
	width: min(96%, 56rem);
}

@media (prefers-color-scheme: dark) {
	.album__deck-shadow::before {
		background: radial-gradient(
			ellipse 72% 100% at 50% 0%,
			rgba(0, 0, 0, 0.28) 0%,
			rgba(0, 0, 0, 0.09) 52%,
			transparent 78%
		);
	}
}

@keyframes album-rm-cards-region-in {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

/*
 * Reduced-motion deal path: JS skips unwrap + peel and jumps to `dealPhase === 'static'` (instant
 * grid). Cards-only crossfade — roster title/completeness already use short opacity fades.
 */
@media (prefers-reduced-motion: reduce) {
	.album__results-cards-region--rm-reveal {
		animation: album-rm-cards-region-in 0.22s ease-out both;
	}

	.album__binder {
		transform: none;
	}

	.album__results-heading {
		transform: none;
	}

	.album__deck-anticipation::before {
		animation: none;
		opacity: 0;
	}

	.album__pack-stage--deal-act1 {
		animation: none;
		transform: none;
	}

	.album__card-deal--idle,
	.album__card-deal--measuring {
		opacity: 1;
		pointer-events: auto;
	}

	.album__card-deal--animate {
		animation: none;
		filter: none;
		opacity: 1;
		transform: translate3d(0, 0, 0) rotateY(0deg)
			rotateZ(calc(var(--deal-twist, 0deg) * var(--deal-rest, 0.24)))
			scale3d(1, 1, 1);
		will-change: auto;
		z-index: auto;
	}
}

.album__results:focus {
	outline: none;
}

.album__results:focus-visible {
	box-shadow:
		0 0 0 3px var(--color-focus-ring),
		0 0 0 5px var(--color-ui-gum);
	outline: 2px solid transparent;
}

.album__results-heading {
	align-items: center;
	display: flex;
	flex-direction: column;
	gap: 0.65rem;
	grid-column: 1 / -1;
	justify-self: stretch;
	margin: 0 0 0.25rem;
	width: 100%;
}

.album__results--title {
	animation: album-roster-fade-in 0.32s ease both;
	color: var(--theme-heading, var(--color-text));
	font-family: var(--font-ui-display);
	font-size: clamp(1.2rem, 3.6vw, 1.85rem);
	font-variant-numeric: tabular-nums;
	font-weight: 400;
	letter-spacing: 0.1em;
	line-height: 1.2;
	margin: 0;
	max-width: min(100%, 42rem);
	padding: 0.55rem 1.35rem 0.65rem;
	position: relative;
	text-align: center;
	text-transform: uppercase;
	z-index: 0;
}

/* Pennant / ticket slab: trapezoid packaging color + top “foil” band (stays behind copy). */
.album__results--title::before {
	background:
		linear-gradient(
			90deg,
			transparent 0%,
			color-mix(in srgb, var(--theme-heading, var(--color-ui-crimson)) 42%, transparent) 50%,
			transparent 100%
		)
			0 0 / 100% 3px no-repeat,
		linear-gradient(
			175deg,
			var(--album-roster-pennant-a) 0%,
			var(--album-roster-pennant-b) 100%
		);
	box-shadow:
		inset 0 1px 0 rgba(250, 244, 232, 0.34),
		inset 0 -1px 0 rgba(28, 25, 23, 0.07),
		0 3px 10px var(--album-roster-pennant-shadow);
	clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);
	content: '';
	inset: -0.08rem -0.4rem -0.12rem;
	position: absolute;
	z-index: -1;
}

.album__results-completeness {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	margin: 0;
	max-width: min(26rem, 100%);
	width: 100%;
}

.album__results-completeness-count {
	animation: album-roster-fade-in 0.26s ease 0.06s both;
	color: var(--color-text-muted);
	font-family: var(--font-ui-heading);
	font-size: 0.6875rem;
	font-variant: small-caps;
	font-weight: 600;
	letter-spacing: 0.2em;
	line-height: 1.3;
	text-align: center;
	text-transform: lowercase;
}

.album__results-completeness-track {
	animation: album-roster-fade-in 0.28s ease 0.1s both;
	background: var(--album-roster-completeness-track);
	border-radius: 2px;
	box-shadow: inset 0 0 0 1px rgba(28, 25, 23, 0.06);
	height: 3px;
	overflow: hidden;
	transform-origin: center center;
	width: 100%;
}

.album__results-completeness-fill {
	background: linear-gradient(
		90deg,
		color-mix(in srgb, var(--theme-heading, var(--color-ui-crimson)) 72%, var(--color-accent) 28%),
		color-mix(in srgb, var(--theme-heading, var(--color-ui-crimson)) 45%, transparent)
	);
	box-shadow: 0 0 12px var(--album-roster-completeness-glow);
	display: block;
	height: 100%;
	min-width: 6%;
	transition: width 0.45s ease;
}

@media (prefers-color-scheme: dark) {
	.album__results--title {
		color: var(--color-text);
	}

	@supports (color: color-mix(in srgb, red 10%, blue 90%)) {
		.album__results--title {
			color: color-mix(
				in srgb,
				var(--theme-heading, var(--color-text)) 45%,
				var(--color-text) 55%
			);
		}
	}
}

@keyframes album-roster-fade-in {
	0% {
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
}

@media (prefers-reduced-motion: reduce) {
	.album__results--title {
		animation: album-roster-fade-in 0.22s ease both !important;
		transform: none;
	}

	.album__results-completeness-count {
		animation: album-roster-fade-in 0.22s ease 0.06s both !important;
		transform: none;
	}

	.album__results-completeness-track {
		animation: album-roster-fade-in 0.24s ease 0.08s both !important;
		transform: scaleX(1);
	}
}

</style>
