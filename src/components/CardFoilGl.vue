<template>
	<canvas
		v-show="visible"
		ref="canvasRef"
		class="card-foil-gl"
		aria-hidden="true"
	/>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { setCardFoilWebglDomActive } from '../lib/cardFoilDom';
import { createCardFoilRenderer, parseCssDeg } from '../lib/cardFoilWebgl';

const props = defineProps({
	/** Ref to `.card__tilt` (fills same box as the faces; inherits `--card-tilt-*` from scene). */
	containerEl: {
		type: Object,
		required: true
	},
	manyPlayers: {
		type: Boolean,
		default: false
	},
	/** Reverse face: mirror tilt so foil tracks the visible surface after rotateY(180). */
	faceBack: {
		type: Boolean,
		default: false
	}
});

const canvasRef = ref(null);
const visible = ref(false);
const reduceMotion = ref(false);

let renderer = null;
let rafId = null;
let startTime = 0;
let mql;

let domSignalActive = false;
let lostAwaitingRecovery = false;
let gestureRecoveryCleanup = null;

function setFoilDomSignal(on) {
	if (on === domSignalActive) {
		return;
	}
	domSignalActive = on;
	setCardFoilWebglDomActive(on);
}

function readReduceMotion() {
	reduceMotion.value =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function stopLoop() {
	if (rafId != null) {
		cancelAnimationFrame(rafId);
		rafId = null;
	}
}

function removeGestureRecovery() {
	gestureRecoveryCleanup?.();
	gestureRecoveryCleanup = null;
}

function tryRecoverWebglAfterGesture() {
	if (!lostAwaitingRecovery) {
		return;
	}
	const canvas = canvasRef.value;
	if (!canvas) {
		return;
	}
	const next = createCardFoilRenderer(canvas);
	if (next) {
		renderer = next;
		lostAwaitingRecovery = false;
		removeGestureRecovery();
		restartLoop();
	} else {
		scheduleGestureRecovery();
	}
}

function scheduleGestureRecovery() {
	removeGestureRecovery();
	const handler = () => {
		tryRecoverWebglAfterGesture();
	};
	window.addEventListener('pointerdown', handler, { capture: true });
	gestureRecoveryCleanup = () => {
		window.removeEventListener('pointerdown', handler, { capture: true });
	};
}

function onWebglContextLost(event) {
	event.preventDefault();
	stopLoop();
	visible.value = false;
	setFoilDomSignal(false);
	try {
		renderer?.dispose();
	} catch {
		/* invalid GL object after loss */
	}
	renderer = null;
	lostAwaitingRecovery = true;
	scheduleGestureRecovery();
}

function onWebglContextRestored() {
	lostAwaitingRecovery = false;
	removeGestureRecovery();
	const canvas = canvasRef.value;
	if (!canvas) {
		return;
	}
	renderer = createCardFoilRenderer(canvas);
	if (renderer) {
		restartLoop();
	} else {
		lostAwaitingRecovery = true;
		scheduleGestureRecovery();
	}
}

function attachCanvasListeners(canvas) {
	canvas.addEventListener('webglcontextlost', onWebglContextLost, false);
	canvas.addEventListener('webglcontextrestored', onWebglContextRestored, false);
}

function detachCanvasListeners(canvas) {
	canvas.removeEventListener('webglcontextlost', onWebglContextLost, false);
	canvas.removeEventListener('webglcontextrestored', onWebglContextRestored, false);
}

function loop() {
	const el = props.containerEl?.value;
	const canvas = canvasRef.value;
	if (!renderer || reduceMotion.value || !el || !canvas) {
		visible.value = false;
		setFoilDomSignal(false);
		stopLoop();
		return;
	}

	const w = Math.max(1, Math.round(el.clientWidth));
	const h = Math.max(1, Math.round(el.clientHeight));
	if (w < 4 || h < 4) {
		visible.value = false;
		setFoilDomSignal(false);
		stopLoop();
		return;
	}

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const pw = Math.max(1, Math.round(w * dpr));
	const ph = Math.max(1, Math.round(h * dpr));
	if (canvas.width !== pw || canvas.height !== ph) {
		canvas.width = pw;
		canvas.height = ph;
	}

	const cs = getComputedStyle(el);
	let tiltX = parseCssDeg(cs.getPropertyValue('--card-tilt-x'));
	let tiltY = parseCssDeg(cs.getPropertyValue('--card-tilt-y'));
	if (props.faceBack) {
		tiltY = -tiltY;
	}
	const baseIntensity = props.manyPlayers ? 0.34 : 0.55;
	const intensity = props.faceBack ? baseIntensity * 0.9 : baseIntensity;
	const t = reduceMotion.value ? 0 : (performance.now() - startTime) / 1000;

	visible.value = true;
	setFoilDomSignal(true);
	renderer.draw(tiltX, tiltY, t, intensity, canvas.width, canvas.height);
	rafId = requestAnimationFrame(loop);
}

function restartLoop() {
	stopLoop();
	const el = props.containerEl?.value;
	if (!renderer || reduceMotion.value || !el) {
		visible.value = false;
		setFoilDomSignal(false);
		return;
	}
	startTime = performance.now();
	loop();
}

watch(reduceMotion, restartLoop);

onMounted(() => {
	readReduceMotion();
	mql = window.matchMedia('(prefers-reduced-motion: reduce)');
	mql.addEventListener('change', readReduceMotion);

	const canvas = canvasRef.value;
	if (!canvas) {
		return;
	}

	attachCanvasListeners(canvas);

	renderer = createCardFoilRenderer(canvas);
	if (!renderer) {
		return;
	}

	restartLoop();
});

onBeforeUnmount(() => {
	stopLoop();
	removeGestureRecovery();
	mql?.removeEventListener('change', readReduceMotion);
	const canvas = canvasRef.value;
	if (canvas) {
		detachCanvasListeners(canvas);
	}
	try {
		renderer?.dispose();
	} catch {
		/* context may be lost */
	}
	renderer = null;
	lostAwaitingRecovery = false;
	domSignalActive = false;
	setCardFoilWebglDomActive(false);
});
</script>

<style scoped>
.card-foil-gl {
	background: transparent;
	border-radius: 9px;
	box-sizing: border-box;
	display: block;
	inset: 0;
	pointer-events: none;
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 10;
}
</style>
