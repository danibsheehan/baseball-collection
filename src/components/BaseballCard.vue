<template>
  <div class="card__defer">
    <div class="card__shell" :class="{ 'card__shell--collected': collected }">
      <div
        ref="sceneRef"
        class="card__scene"
        :class="{ 'card__scene--many': manyPlayers }"
        :data-theme="theme || undefined"
        :style="tiltStyle"
        @pointerenter="onScenePointerEnter"
        @pointermove="onPointerMove"
        @pointerleave="onScenePointerLeave"
        @pointerdown="onPointerDown"
        @focusin.capture="onSceneFocusIn"
        @focusout.capture="onSceneFocusOut"
      >
        <div ref="tiltRef" class="card__tilt">
          <div
            class="card__container"
            role="button"
            tabindex="0"
            :aria-pressed="flipped"
            :aria-label="flipAriaLabel"
            @click="flipCard"
            @keydown="onFlipKeydown"
            v-bind:class="{ 'card__container--flipped': flipped }"
          >
            <CardFront
              :player="player"
              :teamName="teamName"
              :positionName="primaryPositionName"
              :manyPlayers="manyPlayers"
            />
            <CardBack
              v-if="flipped || hasLoadedBack"
              :player="player"
              :playerInfo="player.playerInfo"
              :teamName="teamName"
              :manyPlayers="manyPlayers"
            />
          </div>
          <CardFoilGl
            v-if="isFoilTarget"
            :container-el="tiltRef"
            :face-back="flipped"
            :many-players="manyPlayers"
          />
        </div>
      </div>
      <button
        type="button"
        class="card__collect"
        :aria-pressed="collected ? 'true' : 'false'"
        :aria-label="collectAriaLabel"
        @click="onCollectClick"
      >
        <span class="card__collect-mark" aria-hidden="true">{{ collected ? 'IN' : '+' }}</span>
        <span class="card__collect-label" aria-hidden="true">{{
          collected ? 'Album' : 'Collect'
        }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRef, nextTick } from 'vue';
import CardBack from './CardBack.vue';
import CardFoilGl from './CardFoilGl.vue';
import CardFront from './CardFront.vue';
import { cardFoilTarget, clearCardFoilTarget, setCardFoilTarget } from '../lib/cardFoilBridge';
import { useCardTilt } from '../lib/useCardTilt';

const props = defineProps({
  player: {
    type: Object,
  },
  teamName: {
    type: String,
  },
  theme: {
    type: String,
  },
  manyPlayers: {
    type: Boolean,
    default: false,
  },
  collected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle-collect']);

const sceneRef = ref(null);
const tiltRef = ref(null);

const primaryPositionName = computed(() => props.player?.playerInfo?.primaryPosition?.name ?? '');

const playerDisplayName = computed(() => props.player?.person?.fullName || 'Player');

const isFoilTarget = computed(() => {
  const id = props.player?.person?.id;
  return id != null && cardFoilTarget.value?.id === id;
});

const {
  tiltStyle,
  onPointerEnter: tiltPointerEnter,
  onPointerMove,
  onPointerLeave: tiltPointerLeave,
  onPointerDown,
} = useCardTilt(sceneRef, toRef(props, 'manyPlayers'));

function foilPlayerId() {
  return props.player?.person?.id;
}

function claimFoil() {
  const id = foilPlayerId();
  if (id == null || !sceneRef.value) {
    return;
  }
  setCardFoilTarget(sceneRef.value, id, props.manyPlayers);
}

function releaseFoilIfIdle() {
  const id = foilPlayerId();
  if (id == null) {
    return;
  }
  nextTick(() => {
    const root = sceneRef.value;
    if (!root) {
      clearCardFoilTarget(id);
      return;
    }
    if (root.contains(document.activeElement)) {
      return;
    }
    if (root.matches(':hover')) {
      return;
    }
    clearCardFoilTarget(id);
  });
}

function onScenePointerEnter() {
  tiltPointerEnter();
  claimFoil();
}

function onScenePointerLeave() {
  tiltPointerLeave();
  releaseFoilIfIdle();
}

function onSceneFocusIn(event) {
  if (sceneRef.value?.contains(event.target)) {
    claimFoil();
  }
}

function onSceneFocusOut() {
  releaseFoilIfIdle();
}

const flipped = ref(false);
const hasLoadedBack = ref(false);

const flipAriaLabel = computed(() => {
  return `Baseball card for ${playerDisplayName.value}. Press Enter or Space to flip between front and back.`;
});

const collectAriaLabel = computed(() => {
  const name = playerDisplayName.value;
  return props.collected ? `Remove ${name} from your album` : `Add ${name} to your album`;
});

function flipCard() {
  const nextFlipped = !flipped.value;
  flipped.value = nextFlipped;
  if (nextFlipped) {
    hasLoadedBack.value = true;
  }
}

function onFlipKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }
  event.preventDefault();
  flipCard();
}

function onCollectClick() {
  const id = props.player?.person?.id;
  if (id == null) {
    return;
  }
  emit('toggle-collect', id);
}
</script>

<style scoped>
/*
 * Off-screen cards: skip layout/paint until near the viewport. If a browser
 * mis-composites 3D flips with this, remove .card__defer’s content-visibility.
 */
.card__defer {
  contain-intrinsic-block-size: 372px; /* ~5:6 card + collect row */
  /* auto skipped subtree decode/paint in some browsers with 3D cards + external images */
  content-visibility: visible;
  max-width: 280px;
  width: 100%;
}

.card__shell {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
  width: 100%;
}

.card__collect {
  align-items: center;
  align-self: stretch;
  background: var(--color-surface-elevated);
  border: 1px solid color-mix(in srgb, var(--color-text) 35%, transparent);
  border-radius: 0;
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink, #1c1917) 12%, transparent);
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  font-family: var(--font-ui-heading, var(--font-card));
  font-size: 0.625rem;
  font-weight: 700;
  gap: 0.28rem;
  justify-content: center;
  letter-spacing: 0.08em;
  line-height: 1;
  padding: 0.4rem 0.5rem;
  position: relative;
  text-transform: uppercase;
  z-index: 1;
}

.card__collect:focus {
  outline: none;
}

.card__collect:focus-visible {
  box-shadow:
    0 0 0 3px var(--color-focus-ring),
    0 0 0 5px var(--color-accent);
}

.card__collect[aria-pressed='true'] {
  background: var(--color-surface-selected);
  border-color: var(--color-ui-ink);
  color: var(--color-text);
  font-weight: 700;
}

.card__collect-mark {
  font-size: 0.7rem;
  line-height: 1;
}

.card__collect-label {
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__shell--collected .card__scene {
  box-shadow:
    var(--shadow-card),
    inset 0 0 0 2px
      color-mix(in srgb, var(--theme-heading, var(--color-ui-crimson)) 55%, transparent);
}

/* Card typography: var(--font-card) — Archivo; see src/styles/tokens.css */
.card__scene {
  aspect-ratio: 5 / 6;
  border: 1px solid var(--color-border-card);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  font-family: var(--font-card);
  height: auto;
  max-width: 280px;
  /* Do not clip: 3D lift + logos need room; rounded chrome comes from faces + border-radius */
  perspective: 720px;
  position: relative;
  /* Avoid filter + 3D: Chrome can composite a bogus full-viewport gray layer. Hover pop = shadow + lift. */
  transition: box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
}

.card__scene:hover,
.card__scene:focus-within:has(.card__container:focus-visible) {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 10px 28px rgba(0, 0, 0, 0.1),
    0 20px 48px rgba(0, 0, 0, 0.09);
}

.card__scene--many {
  box-shadow: var(--shadow-card-large-roster);
}

.card__scene--many:hover,
.card__scene--many:focus-within:has(.card__container:focus-visible) {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 6px 16px rgba(0, 0, 0, 0.08);
}

@media (prefers-color-scheme: dark) {
  .card__collect {
    background: color-mix(
      in srgb,
      var(--color-surface-elevated, #1c1917) 70%,
      var(--color-ui-crimson, #f87171)
    );
    border-color: color-mix(in srgb, var(--color-text) 35%, transparent);
  }

  .card__scene:hover,
  .card__scene:focus-within:has(.card__container:focus-visible) {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.45),
      0 12px 32px rgba(0, 0, 0, 0.42),
      0 24px 56px rgba(0, 0, 0, 0.38);
  }

  .card__scene--many:hover,
  .card__scene--many:focus-within:has(.card__container:focus-visible) {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.4),
      0 6px 18px rgba(0, 0, 0, 0.36);
  }
}

.card__tilt {
  --card-lift: 0px;
  border-radius: 9px;
  height: 100%;
  position: relative;
  transform: rotateX(var(--card-tilt-x, 0deg)) rotateY(var(--card-tilt-y, 0deg))
    translateZ(var(--card-lift));
  transform-style: preserve-3d;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
}

.card__scene:hover .card__tilt,
.card__scene:focus-within:has(.card__container:focus-visible) .card__tilt {
  --card-lift: var(--card-lift-hover);
}

.card__scene--many:hover .card__tilt,
.card__scene--many:focus-within:has(.card__container:focus-visible) .card__tilt {
  --card-lift: var(--card-lift-hover-many);
}

.card__container {
  border-radius: 10px;
  cursor: pointer;
  height: 100%;
  /* Flip: long ease at the end — cardstock flex, not a snappy cube */
  transition: transform 0.78s cubic-bezier(0.2, 0.62, 0.1, 1);
  transform-style: preserve-3d;
  position: relative;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .card__scene {
    transition: none;
  }

  .card__tilt {
    transition: none;
  }

  .card__scene:hover .card__tilt,
  .card__scene:focus-within:has(.card__container:focus-visible) .card__tilt {
    --card-lift: 0px;
  }

  .card__container {
    transition: none;
  }
}

.card__container:focus {
  outline: none;
}

.card__container:focus-visible {
  box-shadow:
    0 0 0 3px var(--color-focus-ring),
    0 0 0 5px var(--color-accent);
}

.card__container--flipped {
  transform: rotateY(180deg);
}
</style>
