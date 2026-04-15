import { ref, computed, watch, onMounted, onBeforeUnmount, unref, type Ref } from 'vue';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

type DeviceOrientationCtor = typeof DeviceOrientationEvent & {
	requestPermission?: () => Promise<'granted' | 'denied' | 'prompt'>;
};

/**
 * Pointer-driven tilt with optional deviceorientation (coarse pointer auto-start;
 * iOS requires permission, requested on first pointerdown on the card).
 */
export function useCardTilt(sceneRef: Ref<HTMLElement | null>, manyPlayersRef: Ref<boolean>) {
	const reduceMotion = ref(false);
	const tiltX = ref(0);
	const tiltY = ref(0);
	const pointerOver = ref(false);
	const orientationListening = ref(false);

	let iosPermissionRequested = false;
	// eslint-disable-next-line no-unused-vars -- name only for DeviceOrientationEvent typing
	let orientHandler: ((event: DeviceOrientationEvent) => void) | null = null;
	let rafId: number | null = null;
	let pendingTx = 0;
	let pendingTy = 0;

	function readReduceMotion() {
		reduceMotion.value =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function maxTilt() {
		return unref(manyPlayersRef) ? 5 : 9;
	}

	function applyTiltImmediate(tx: number, ty: number) {
		tiltX.value = tx;
		tiltY.value = ty;
	}

	function schedulePointerTilt(tx: number, ty: number) {
		pendingTx = tx;
		pendingTy = ty;
		if (rafId != null) {
			return;
		}
		rafId = window.requestAnimationFrame(() => {
			rafId = null;
			tiltX.value = pendingTx;
			tiltY.value = pendingTy;
		});
	}

	function onPointerMove(event: PointerEvent) {
		if (reduceMotion.value) {
			return;
		}
		const el = sceneRef.value;
		if (!el) {
			return;
		}
		const rect = el.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) {
			return;
		}
		const max = maxTilt();
		const x = (event.clientX - rect.left) / rect.width - 0.5;
		const y = (event.clientY - rect.top) / rect.height - 0.5;
		const ty = x * 2 * max;
		const tx = -y * 2 * max;
		schedulePointerTilt(tx, ty);
	}

	function onPointerEnter() {
		pointerOver.value = true;
	}

	function onPointerLeave() {
		pointerOver.value = false;
		if (rafId != null) {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}
		if (!orientationListening.value) {
			applyTiltImmediate(0, 0);
		}
	}

	function startOrientation() {
		if (orientationListening.value || reduceMotion.value) {
			return;
		}
		orientationListening.value = true;
		orientHandler = (e: DeviceOrientationEvent) => {
			if (reduceMotion.value || pointerOver.value) {
				return;
			}
			if (e.gamma == null || e.beta == null) {
				return;
			}
			const max = maxTilt();
			const gx = clamp(e.gamma, -45, 45);
			const beta = clamp(e.beta, 30, 150);
			const ty = (gx / 45) * max;
			const tx = -((beta - 90) / 45) * max;
			schedulePointerTilt(tx, ty);
		};
		window.addEventListener('deviceorientation', orientHandler, { passive: true });
	}

	function tryRequestOrientation() {
		if (reduceMotion.value || orientationListening.value) {
			return;
		}
		const DO = globalThis.DeviceOrientationEvent as DeviceOrientationCtor | undefined;
		if (!DO) {
			return;
		}
		if (typeof DO.requestPermission === 'function') {
			if (iosPermissionRequested) {
				return;
			}
			iosPermissionRequested = true;
			DO.requestPermission()
				.then((state) => {
					if (state === 'granted') {
						startOrientation();
					}
				})
				.catch(() => {});
			return;
		}
		startOrientation();
	}

	function maybeAutoStartOrientation() {
		if (reduceMotion.value || typeof window === 'undefined') {
			return;
		}
		const coarse = window.matchMedia('(pointer: coarse)').matches;
		const ctor = globalThis.DeviceOrientationEvent as DeviceOrientationCtor | undefined;
		const needsGesture = typeof ctor?.requestPermission === 'function';
		if (coarse && !needsGesture) {
			startOrientation();
		}
	}

	let mql: MediaQueryList | undefined;

	onMounted(() => {
		readReduceMotion();
		mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		mql.addEventListener('change', readReduceMotion);
		maybeAutoStartOrientation();
	});

	onBeforeUnmount(() => {
		mql?.removeEventListener('change', readReduceMotion);
		if (rafId != null) {
			window.cancelAnimationFrame(rafId);
		}
		if (orientHandler) {
			window.removeEventListener('deviceorientation', orientHandler);
		}
	});

	watch(reduceMotion, (reduced) => {
		if (reduced) {
			if (rafId != null) {
				window.cancelAnimationFrame(rafId);
				rafId = null;
			}
			applyTiltImmediate(0, 0);
			if (orientHandler) {
				window.removeEventListener('deviceorientation', orientHandler);
				orientHandler = null;
				orientationListening.value = false;
			}
		} else {
			maybeAutoStartOrientation();
		}
	});

	const tiltStyle = computed(() => ({
		'--card-tilt-x': `${tiltX.value}deg`,
		'--card-tilt-y': `${tiltY.value}deg`
	}));

	return {
		tiltStyle,
		onPointerEnter,
		onPointerMove,
		onPointerLeave,
		onPointerDown: tryRequestOrientation
	};
}
