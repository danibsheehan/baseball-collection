<template>
	<div class="player__back" v-if="playerInfo">
		<div class="player__masthead-row">
			<header class="player__masthead">
				<p class="player__name">{{ displayName }}</p>
				<div class="player__role" role="group" :aria-label="`${positionLabel}, ${teamName || ''}`">
					<span class="player__position">{{ positionLabel }}</span>
					<span class="player__role-sep" aria-hidden="true" />
					<span class="player__team">{{ teamName }}</span>
				</div>
			</header>
		</div>

		<div class="player__panel" role="region" aria-label="Player vitals">
			<div class="player__row">
				<div class="player__cell">
					<span class="player__label">Height</span>
					<span class="player__val">{{ playerInfo.height || "—" }}</span>
				</div>
				<div class="player__cell">
					<span class="player__label">Weight</span>
					<span class="player__val">{{ playerInfo.weight || "—" }}</span>
				</div>
			</div>
			<div class="player__row">
				<div class="player__cell">
					<span class="player__label">Bats</span>
					<span class="player__val">{{ batLabel }}</span>
				</div>
				<div class="player__cell">
					<span class="player__label">Throws</span>
					<span class="player__val">{{ throwLabel }}</span>
				</div>
			</div>

			<div class="player__origin">
				<div class="player__row">
					<div class="player__cell">
						<span class="player__label">Born</span>
						<span class="player__val">{{ birthDateDisplay }}</span>
					</div>
					<div class="player__cell">
						<span class="player__label">Hometown</span>
						<span class="player__val player__val--wrap">{{ hometownDisplay }}</span>
					</div>
				</div>
				<div v-if="debutDisplay" class="player__row player__row--full">
					<div class="player__cell player__cell--block player__cell--debut">
						<span class="player__label">M.L. debut</span>
						<span class="player__val">{{ debutDisplay }}</span>
					</div>
				</div>
			</div>

			<div class="player__tail">
				<div v-if="nicknameDisplay" class="player__row player__row--full player__row--tail">
					<div class="player__cell player__cell--block">
						<span class="player__label">Nickname</span>
						<span class="player__val player__val--wrap">{{ nicknameDisplay }}</span>
					</div>
				</div>
				<div v-if="showUniformRow" class="player__row player__row--full player__row--tail">
					<div class="player__cell player__cell--block">
						<span class="player__label">Uniform</span>
						<span class="player__val">{{ uniformDisplay }}</span>
					</div>
				</div>
				<div class="player__watermark" aria-hidden="true">
					<img
						class="player__watermark-img"
						src="/images/vintage-at-bat-watermark.png"
						width="574"
						height="551"
						alt=""
						decoding="async"
					/>
				</div>
			</div>
		</div>

		<p class="player__fine">Statistics from MLB StatsAPI.</p>
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	playerInfo: {
		type: Object
	},
	teamName: {
		type: String,
		default: ''
	},
	fullName: {
		type: String,
		default: ''
	},
	/** Roster jersey; falls back to `playerInfo.primaryNumber` when absent. */
	jerseyNumber: {
		type: [String, Number],
		default: ''
	}
});

const uniformDisplay = computed(() => {
	const roster = props.jerseyNumber != null && String(props.jerseyNumber).trim() !== ''
		? String(props.jerseyNumber).trim()
		: '';
	const primary = props.playerInfo?.primaryNumber != null && String(props.playerInfo.primaryNumber).trim() !== ''
		? String(props.playerInfo.primaryNumber).trim()
		: '';
	const n = roster || primary;
	return n ? `#${n}` : '—';
});

const nicknameDisplay = computed(() => {
	const n = props.playerInfo?.nickName;
	if (n == null || String(n).trim() === '') {
		return '';
	}
	return String(n).trim().toUpperCase();
});

const showUniformRow = computed(() => uniformDisplay.value !== '—');

const displayName = computed(() =>
	String(props.fullName || props.playerInfo?.fullName || "").toUpperCase()
);

const positionLabel = computed(
	() => props.playerInfo?.primaryPosition?.name || "—"
);

const batLabel = computed(
	() => props.playerInfo?.batSide?.description || "—"
);

const throwLabel = computed(
	() => props.playerInfo?.pitchHand?.description || "—"
);

const birthplaceLine = computed(() => {
	const p = props.playerInfo;
	const parts = [
		p?.birthCity,
		p?.birthStateProvince,
		p?.birthCountry
	].filter(Boolean);
	return parts.join(", ");
});

const hometownDisplay = computed(() => birthplaceLine.value || "—");

/** Slightly friendlier than raw ISO when parsable (vintage postcard feel). */
const birthDateDisplay = computed(() => {
	const raw = props.playerInfo?.birthDate;
	if (!raw || typeof raw !== "string") {
		return "—";
	}
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
	if (!m) {
		return raw;
	}
	const [, y, mo, d] = m;
	const months = [
		"JAN",
		"FEB",
		"MAR",
		"APR",
		"MAY",
		"JUN",
		"JUL",
		"AUG",
		"SEP",
		"OCT",
		"NOV",
		"DEC"
	];
	const mi = Number(mo) - 1;
	if (mi < 0 || mi > 11) {
		return raw;
	}
	return `${months[mi]} ${Number(d)}, ${y}`;
});

const debutDisplay = computed(() => {
	const raw = props.playerInfo?.mlbDebutDate;
	if (!raw || typeof raw !== "string") {
		return "";
	}
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
	if (!m) {
		return raw.toUpperCase();
	}
	const [, y, mo, d] = m;
	const months = [
		"JAN",
		"FEB",
		"MAR",
		"APR",
		"MAY",
		"JUN",
		"JUL",
		"AUG",
		"SEP",
		"OCT",
		"NOV",
		"DEC"
	];
	const mi = Number(mo) - 1;
	if (mi < 0 || mi > 11) {
		return raw.toUpperCase();
	}
	return `${months[mi]} ${Number(d)}, ${y}`;
});
</script>

<style scoped>
/*
 * Align with CardBack .card__art-panel: left 6px, top 6px, 38×38 — masthead shares that row
 * (margin-left clears the logo); no tall empty band above.
 */
.player__back {
	--card-back-logo-offset-x: 6px;
	--card-back-logo-size: 38px;
	--card-back-logo-gap: 0.45rem;
	--card-back-masthead-inset: calc(
		var(--card-back-logo-offset-x) + var(--card-back-logo-size) + var(--card-back-logo-gap)
	);

	box-sizing: border-box;
	color: var(--card-back-ink);
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	font-family: var(--font-card);
	height: 100%;
	min-height: 0;
	overflow: hidden;
	padding: 0 0.08rem 0;
	text-transform: uppercase;
	width: 100%;
}

.player__masthead-row {
	align-items: center;
	display: flex;
	flex-shrink: 0;
	min-height: calc(var(--card-back-logo-offset-x) + var(--card-back-logo-size));
	padding: var(--card-back-logo-offset-x) 0 0.28rem;
}

.player__masthead {
	border-bottom: 2px solid var(--card-back-accent);
	box-sizing: border-box;
	flex: 1;
	margin-bottom: 0.18rem;
	margin-left: var(--card-back-masthead-inset);
	min-width: 0;
	padding-bottom: 0.2rem;
	width: auto;
}

.player__name {
	color: var(--card-back-ink);
	font-size: 0.54rem;
	font-size: clamp(0.5rem, min(5cqi, 3.6cqb), 0.66rem);
	font-weight: 800;
	letter-spacing: 0.05em;
	line-height: 1.12;
	margin: 0 0 0.12rem;
}

.player__role {
	align-items: center;
	color: var(--card-back-ink);
	display: flex;
	flex-wrap: wrap;
	font-size: 0.48rem;
	font-size: clamp(0.42rem, min(4cqi, 3cqb), 0.54rem);
	font-weight: 700;
	gap: 0.12rem 0.28rem;
	letter-spacing: 0.08em;
	line-height: 1.15;
}

.player__role-sep {
	background: var(--card-back-rule-strong);
	flex-shrink: 0;
	height: 0.65em;
	width: 1px;
}

.player__panel {
	border: 1px solid var(--card-back-rule-strong);
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
}

.player__row {
	display: grid;
	grid-template-columns: 1fr 1fr;
}

.player__row--full {
	grid-template-columns: 1fr;
}

.player__cell {
	border-bottom: 1px solid var(--card-back-rule);
	border-right: 1px solid var(--card-back-rule);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 0.05rem;
	min-width: 0;
	padding: 0.16rem 0.22rem;
}

.player__panel > .player__row .player__cell:nth-child(2n) {
	border-right: none;
}

.player__cell--block {
	grid-column: 1 / -1;
}

.player__label {
	color: var(--card-back-accent);
	font-size: 0.38rem;
	font-size: clamp(0.34rem, min(3.4cqi, 2.5cqb), 0.46rem);
	font-weight: 800;
	letter-spacing: 0.12em;
	line-height: 1.05;
}

.player__val {
	color: var(--card-back-ink);
	font-size: 0.42rem;
	font-size: clamp(0.38rem, min(3.8cqi, 2.8cqb), 0.5rem);
	font-variant-numeric: tabular-nums;
	font-weight: 700;
	letter-spacing: 0.03em;
	line-height: 1.12;
}

.player__val--wrap {
	letter-spacing: 0.03em;
	text-transform: uppercase;
	white-space: normal;
	word-break: break-word;
}

/* Bio band: ties birth + hometown (and optional debut) into one vintage “origin” block */
.player__origin {
	border-top: 2px solid var(--card-back-accent);
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	margin-top: 1px;
}

/* Uniform row + watermark; watermark pinned to tail bottom without flex-grow eating height */
.player__tail {
	border-top: 1px solid var(--card-back-rule);
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	justify-content: flex-start;
	min-height: 0;
	overflow: hidden;
}

.player__row--tail .player__cell {
	background: linear-gradient(
		180deg,
		color-mix(in srgb, var(--card-back-paper-raised) 40%, var(--card-back-paper)) 0%,
		var(--card-back-paper) 100%
	);
	border-right: 1px solid var(--card-back-rule);
}

.player__tail .player__row--full .player__cell {
	border-right: none;
}

.player__tail .player__row--tail .player__cell:nth-child(2n) {
	border-right: none;
}

.player__tail .player__row--tail:last-of-type .player__cell {
	border-bottom: none;
}

.player__tail .player__row--tail:not(:last-of-type) .player__cell {
	border-bottom: 1px solid var(--card-back-rule);
}

/*
 * Compact watermark at bottom of tail — no flex-grow so stats keep vertical room.
 */
.player__watermark {
	align-items: flex-end;
	align-self: stretch;
	box-sizing: border-box;
	display: flex;
	flex: 0 0 auto;
	justify-content: flex-end;
	margin-top: auto;
	/* Inset from panel / card edge — was tight against the border */
	padding: 0.15rem 0.42rem 0.42rem;
	pointer-events: none;
}

.player__watermark-img {
	display: block;
	flex-shrink: 0;
	height: auto;
	max-height: min(2.75rem, 18cqb);
	max-width: 100%;
	mix-blend-mode: multiply;
	object-fit: contain;
	opacity: 0.14;
	width: min(3.25rem, 42cqi);
}

@media (prefers-color-scheme: dark) {
	.player__watermark-img {
		mix-blend-mode: lighten;
		opacity: 0.2;
	}
}

.player__origin .player__row .player__cell {
	background: linear-gradient(
		165deg,
		var(--card-back-paper-raised) 0%,
		color-mix(in srgb, var(--card-back-paper) 88%, var(--card-back-paper-raised)) 100%
	);
}

.player__origin .player__row:only-child .player__cell,
.player__origin .player__row:last-child .player__cell {
	border-bottom: none;
}

.player__origin .player__row .player__cell:nth-child(2n) {
	border-right: none;
}

.player__cell--debut {
	border-left: 2px solid var(--card-back-accent);
	padding-left: 0.38rem;
}

.player__fine {
	color: var(--card-back-fine);
	flex-shrink: 0;
	font-size: 0.32rem;
	font-size: clamp(0.3rem, min(2.6cqi, 2cqb), 0.38rem);
	font-weight: 600;
	letter-spacing: 0.05em;
	line-height: 1.2;
	margin: 0.2rem 0 0;
	text-transform: uppercase;
}
</style>
