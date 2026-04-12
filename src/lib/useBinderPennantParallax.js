import { onMounted, onBeforeUnmount, unref, watch } from 'vue';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Smoothstep — soft edges on scroll phase (less “linear slide” feel) */
function smoothstep01(t) {
	const x = clamp(t, 0, 1);
	return x * x * (3 - 2 * x);
}

/**
 * Scroll- + pointer-driven parallax for the album binder and roster pennant (CSS variables).
 * Scroll and pointer targets are both exponentially smoothed; rAF chains until motion settles
 * so pointer-out decay is actually visible.
 *
 * @param {object} args
 * @param {import('vue').Ref<HTMLElement | null>} args.binderRef
 * @param {import('vue').Ref<HTMLElement | null>} args.pennantRef
 * @param {import('vue').Ref<HTMLElement | null>} args.feltRailRef
 * @param {object} [args.options]
 * @param {boolean} [args.options.enabled=true] — set false to keep binder/pennant static (print-like UI).
 */
export function useBinderPennantParallax({ binderRef, pennantRef, feltRailRef, options = {} }) {
	const parallaxEnabled = options.enabled !== false;
	const binderMaxY = options.binderMaxY ?? 6;
	const pennantMaxX = options.pennantMaxX ?? 9;
	const pennantMaxY = options.pennantMaxY ?? 4;
	const pennantMaxRz = options.pennantMaxRz ?? 1.6;
	const pointerLerp = options.pointerLerp ?? 0.11;
	const scrollLerp = options.scrollLerp ?? 0.1;

	let reduceMotion = true;
	let finePointer = false;
	let rafId = 0;
	let pending = false;
	let targetPtrX = 0;
	let targetPtrY = 0;
	let smoothPtrX = 0;
	let smoothPtrY = 0;
	/** Smoothed scroll phase 0…1 (follows binder position in viewport) */
	let smoothScrollPhase = 0.5;

	function readEnv() {
		if (typeof window === 'undefined') {
			return;
		}
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		finePointer = window.matchMedia('(pointer: fine)').matches;
	}

	function clearParallaxVars() {
		const b = unref(binderRef);
		const p = unref(pennantRef);
		if (b?.style) {
			b.style.removeProperty('--binder-parallax-y');
		}
		if (p?.style) {
			p.style.removeProperty('--pennant-parallax-x');
			p.style.removeProperty('--pennant-parallax-y');
			p.style.removeProperty('--pennant-parallax-rz');
		}
	}

	/** Raw scroll phase from binder position (linear 0…1) */
	function readScrollPhaseRaw() {
		const binder = unref(binderRef);
		if (!binder || typeof window === 'undefined') {
			return 0.5;
		}
		const rect = binder.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		/* Wider band = gentler rate of change across normal scroll */
		return clamp((vh * 0.78 - rect.top) / (vh * 1.05), 0, 1);
	}

	function applyPointerDeadZone(x, y) {
		const dz = 0.055;
		const sx = Math.abs(x) < dz ? 0 : Math.sign(x) * ((Math.abs(x) - dz) / (1 - dz));
		const sy = Math.abs(y) < dz ? 0 : Math.sign(y) * ((Math.abs(y) - dz) / (1 - dz));
		return { x: clamp(sx, -1, 1), y: clamp(sy, -1, 1) };
	}

	/**
	 * @returns {boolean} true if another frame should run (smoothing not settled)
	 */
	function applyFrame() {
		if (reduceMotion || !parallaxEnabled) {
			return false;
		}
		const b = unref(binderRef);
		const p = unref(pennantRef);
		if (!b) {
			return false;
		}

		const rawPhase = readScrollPhaseRaw();
		smoothScrollPhase += (rawPhase - smoothScrollPhase) * scrollLerp;
		const u = smoothstep01(smoothScrollPhase);

		smoothPtrX += (targetPtrX - smoothPtrX) * pointerLerp;
		smoothPtrY += (targetPtrY - smoothPtrY) * pointerLerp;

		/* Scroll: subtle vertical drift on binder; pennant gets a hint of opposite motion */
		const binderYScroll = (0.5 - u) * 2 * binderMaxY * 0.85;
		const binderY = clamp(
			binderYScroll + smoothPtrY * binderMaxY * 0.42,
			-binderMaxY * 1.15,
			binderMaxY * 1.15
		);
		b.style.setProperty('--binder-parallax-y', `${binderY.toFixed(3)}px`);

		if (p?.style) {
			/* Pointer-led X / slight Y; scroll adds a tiny horizontal “drag” for depth */
			const scrollXBias = (u - 0.5) * pennantMaxX * 0.28;
			const penX = clamp(
				smoothPtrX * pennantMaxX * 0.92 + scrollXBias,
				-pennantMaxX * 1.05,
				pennantMaxX * 1.05
			);
			const penY = clamp(
				(u - 0.5) * 2 * pennantMaxY * 0.55 + smoothPtrY * pennantMaxY * 0.38,
				-pennantMaxY * 1.1,
				pennantMaxY * 1.1
			);
			const penRz = clamp(
				(u - 0.5) * 2 * pennantMaxRz * 0.45 + smoothPtrX * pennantMaxRz * 0.75,
				-pennantMaxRz * 1.1,
				pennantMaxRz * 1.1
			);
			p.style.setProperty('--pennant-parallax-x', `${penX.toFixed(3)}px`);
			p.style.setProperty('--pennant-parallax-y', `${penY.toFixed(3)}px`);
			p.style.setProperty('--pennant-parallax-rz', `${penRz.toFixed(3)}deg`);
		}

		const epsP = 0.0015;
		const epsS = 0.0018;
		const pointerSettling =
			Math.abs(targetPtrX - smoothPtrX) > epsP || Math.abs(targetPtrY - smoothPtrY) > epsP;
		const scrollSettling = Math.abs(rawPhase - smoothScrollPhase) > epsS;
		return pointerSettling || scrollSettling;
	}

	function schedule() {
		if (reduceMotion || !parallaxEnabled) {
			return;
		}
		if (pending) {
			return;
		}
		pending = true;
		rafId = window.requestAnimationFrame(() => {
			rafId = 0;
			pending = false;
			const still = applyFrame();
			if (still) {
				schedule();
			}
		});
	}

	function onScroll() {
		schedule();
	}

	function onPointerMove(ev) {
		const felt = unref(feltRailRef);
		if (!felt) {
			return;
		}
		const r = felt.getBoundingClientRect();
		if (r.width <= 0 || r.height <= 0) {
			return;
		}
		let nx = ((ev.clientX - r.left) / r.width) * 2 - 1;
		let ny = ((ev.clientY - r.top) / r.height) * 2 - 1;
		/* Softer response at extremes (less twitchy near rail edges) */
		nx *= 0.88;
		ny *= 0.88;
		const dz = applyPointerDeadZone(nx, ny);
		targetPtrX = dz.x;
		targetPtrY = dz.y;
		schedule();
	}

	function onPointerLeave() {
		targetPtrX = 0;
		targetPtrY = 0;
		schedule();
	}

	function onReduceMotionChange() {
		readEnv();
		if (reduceMotion) {
			if (rafId) {
				window.cancelAnimationFrame(rafId);
				rafId = 0;
			}
			pending = false;
			targetPtrX = 0;
			targetPtrY = 0;
			smoothPtrX = 0;
			smoothPtrY = 0;
			smoothScrollPhase = 0.5;
			clearParallaxVars();
		} else {
			schedule();
		}
	}

	let mqReduce = null;

	watch(
		pennantRef,
		() => {
			if (!parallaxEnabled) {
				return;
			}
			readEnv();
			if (!reduceMotion) {
				schedule();
			}
		},
		{ flush: 'post' }
	);

	onMounted(() => {
		readEnv();
		if (!parallaxEnabled) {
			clearParallaxVars();
			return;
		}
		if (reduceMotion) {
			return;
		}
		smoothScrollPhase = readScrollPhaseRaw();

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
		mqReduce.addEventListener('change', onReduceMotionChange);

		const felt = unref(feltRailRef);
		if (felt && finePointer) {
			felt.addEventListener('pointermove', onPointerMove, { passive: true });
			felt.addEventListener('pointerleave', onPointerLeave);
			felt.addEventListener('pointercancel', onPointerLeave);
		}

		schedule();
	});

	onBeforeUnmount(() => {
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onScroll);
		if (mqReduce) {
			mqReduce.removeEventListener('change', onReduceMotionChange);
		}
		const felt = unref(feltRailRef);
		if (felt) {
			felt.removeEventListener('pointermove', onPointerMove);
			felt.removeEventListener('pointerleave', onPointerLeave);
			felt.removeEventListener('pointercancel', onPointerLeave);
		}
		if (rafId) {
			window.cancelAnimationFrame(rafId);
		}
		clearParallaxVars();
	});
}
