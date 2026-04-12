<template>
	<div
		ref="rootRef"
		class="album__pack-lottie"
		role="img"
		aria-label="Baseball card pack opening animation"
	/>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import lottie from 'lottie-web';

const props = defineProps({
	dealPhase: { type: String, required: true },
	runId: { type: Number, required: true },
});

const emit = defineEmits(['unwrap-complete']);

const rootRef = ref(null);
let anim = null;

const packJsonUrl = `${import.meta.env.BASE_URL}lottie/baseball-pack.json`;

/** Card deal starts at most this many ms after `play()` — wall-handoff cap on long Lottie comps */
const PACK_DEAL_WALL_MAX_MS = 1500;

/** Cleared on each load so a stale timeout never fires after a new deal */
let packSafetyTimer = null;
/** Wall-clock target from `play()` — does not rely on flaky `complete` / last-frame `enterFrame` */
let playDeadlineTimer = null;

function clearPackSafetyTimer() {
	if (packSafetyTimer != null) {
		window.clearTimeout(packSafetyTimer);
		packSafetyTimer = null;
	}
}

function clearPlayDeadlineTimer() {
	if (playDeadlineTimer != null) {
		window.clearTimeout(playDeadlineTimer);
		playDeadlineTimer = null;
	}
}

/** Tear down Lottie SVG player on unwrap handoff, team change, and unmount — avoids leaking rAF/DOM layers */
function destroyAnim() {
	clearPackSafetyTimer();
	clearPlayDeadlineTimer();
	if (anim) {
		try {
			anim.destroy();
		} catch {
			/* ignore */
		}
		anim = null;
	}
}

function scheduleSafetyEmit(run, ms) {
	clearPackSafetyTimer();
	packSafetyTimer = window.setTimeout(() => {
		packSafetyTimer = null;
		if (run === props.runId) {
			emit('unwrap-complete', run);
		}
	}, ms);
}

function animationDurationMs(animationData) {
	const ip = typeof animationData.ip === 'number' ? animationData.ip : 0;
	const op = typeof animationData.op === 'number' ? animationData.op : 0;
	const fr = typeof animationData.fr === 'number' && animationData.fr > 0 ? animationData.fr : 30;
	return Math.ceil(((op - ip) / fr) * 1000);
}

async function loadAndPlay() {
	destroyAnim();
	const el = rootRef.value;
	if (!el) {
		return;
	}

	const run = props.runId;

	if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		emit('unwrap-complete', run);
		return;
	}

	try {
		const res = await fetch(packJsonUrl);
		if (!res.ok) {
			throw new Error(`lottie fetch ${res.status}`);
		}
		const animationData = await res.json();
		if (run !== props.runId || props.dealPhase !== 'opening') {
			return;
		}

		const durationMs = animationDurationMs(animationData);
		const reducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let unwrapDone = false;
		let playbackStarted = false;
		/** Act 2 — brief pause near mid-unwrap so the “pop” reads as a climax (skipped for reduced motion) */
		let peakHoldDone = false;

		const onComplete = () => {
			fireUnwrap();
		};

		const onEnterFrame = () => {
			if (!anim || unwrapDone || !playbackStarted) {
				return;
			}
			const tf = anim.totalFrames;
			/* ~1–2 frames at ~30fps ≈ one beat; tune with `PEAK_FRAC` per comp */
			const PEAK_FRAC = 0.48;
			const HOLD_MS = 88;
			if (
				!peakHoldDone &&
				!reducedMotion &&
				tf > 10 &&
				anim.currentFrame >= PEAK_FRAC * tf
			) {
				peakHoldDone = true;
				anim.pause();
				window.setTimeout(() => {
					if (!anim || unwrapDone || run !== props.runId || props.dealPhase !== 'opening') {
						return;
					}
					anim.play();
				}, HOLD_MS);
			}
			/* Some exports never call `complete` in the SVG player — mirror the engine’s end condition */
			/* Fire a hair before the engine’s last frame so we are not gated on a missing `complete` */
			if (tf > 0 && anim.currentFrame >= tf - 2 - 1e-6) {
				fireUnwrap();
			}
		};

		const fireUnwrap = () => {
			if (unwrapDone || run !== props.runId || props.dealPhase !== 'opening') {
				return;
			}
			unwrapDone = true;
			clearPackSafetyTimer();
			clearPlayDeadlineTimer();
			if (anim) {
				anim.removeEventListener('enterFrame', onEnterFrame);
				anim.removeEventListener('complete', onComplete);
			}
			emit('unwrap-complete', run);
		};

		anim = lottie.loadAnimation({
			container: el,
			renderer: 'svg',
			loop: false,
			autoplay: false,
			animationData,
		});

		anim.addEventListener('complete', onComplete);
		anim.addEventListener('enterFrame', onEnterFrame);
		/* Absolute backstop if neither DOMLoaded nor playback runs (corrupt / wedged load) */
		scheduleSafetyEmit(run, Math.max(18000, durationMs + 8000));

		anim.addEventListener('DOMLoaded', () => {
			if (run !== props.runId || !anim) {
				return;
			}
			clearPackSafetyTimer();
			/* If `complete` / `enterFrame` never fire, still do not wait past nominal duration + small buffer */
			scheduleSafetyEmit(run, durationMs + 600);

			playbackStarted = true;
			anim.play();

			/* Primary handoff: wall clock from `play()`, capped (~1.5s) on long Lottie comps */
			const leadMs = 140;
			const byJsonDuration = Math.max(0, durationMs - leadMs);
			const wallMs = Math.min(byJsonDuration, PACK_DEAL_WALL_MAX_MS);
			playDeadlineTimer = window.setTimeout(() => {
				playDeadlineTimer = null;
				fireUnwrap();
			}, wallMs);
		});
	} catch {
		scheduleSafetyEmit(run, 2600);
	}
}

watch(
	() => props.dealPhase,
	(phase) => {
		if (phase === 'opening') {
			nextTick(() => {
				loadAndPlay();
			});
		} else if (phase === 'measuring') {
			/* Lottie stays visible (unused path today — kept for clarity) */
		} else if (phase === 'ready') {
			destroyAnim();
		} else {
			destroyAnim();
		}
	},
	/* immediate: mount can happen the same tick as `opening` — lazy watch would skip loadAndPlay */
	{ flush: 'post', immediate: true }
);

onBeforeUnmount(() => {
	destroyAnim();
});

defineExpose({
	getPackEl: () => rootRef.value,
});
</script>

<style scoped>
/*
 * Composition is 512×512 with art not edge-to-edge — box + scale; caps raised on wide viewports.
 * Mobile: `46vmin` was almost always below the 13rem floor on phones, so the pack sat at minimum size.
 */
.album__pack-lottie {
	align-items: center;
	box-sizing: border-box;
	display: flex;
	height: clamp(14.5rem, min(62vmin, 92vw), 24rem);
	justify-content: center;
	margin-block: clamp(0.5rem, 2.5vw, 1rem);
	max-width: 100%;
	overflow: visible;
	width: min(36rem, calc(100% - 0.75rem));
}

.album__pack-lottie :deep(svg) {
	border-radius: 10px 10px 14px 14px;
	display: block;
	height: 100% !important;
	max-height: none;
	max-width: none;
	transform: scale(1.24);
	transform-origin: center center;
	width: 100% !important;
}

/*
 * Tablet (640–899px): between phone and `.album__results` 3-col / desktop pack tier at 900px.
 * More canvas than phones — raise clamp ceiling + width cap so the unwrap does not read undersized.
 */
@media (min-width: 640px) and (max-width: 899px) {
	.album__pack-lottie {
		height: clamp(15.5rem, min(56vmin, 78vw), 28rem);
		width: min(42rem, calc(100% - 1.25rem));
	}

	.album__pack-lottie :deep(svg) {
		transform: scale(1.28);
	}
}

@media (min-width: 900px) {
	.album__pack-lottie {
		height: clamp(15rem, min(52vmin, 44vw), 34rem);
		width: min(48rem, calc(100% - 2rem));
	}

	.album__pack-lottie :deep(svg) {
		transform: scale(1.3);
	}
}

@media (min-width: 1400px) {
	.album__pack-lottie {
		height: clamp(17rem, min(54vmin, 40vw), 42rem);
		width: min(60rem, calc(100% - 2.5rem));
	}

	.album__pack-lottie :deep(svg) {
		transform: scale(1.42);
	}
}
</style>
