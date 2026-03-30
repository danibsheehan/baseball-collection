<template>
	<div class="card__defer">
		<div class="card__scene" :data-theme="theme || undefined">
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
				<CardFront :player="player" />
				<CardBack
					v-if="flipped || hasLoadedBack"
					:player="player"
					:playerInfo="player.playerInfo"
					:teamName="teamName"
					:manyPlayers="manyPlayers"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CardBack from './CardBack.vue';
import CardFront from './CardFront.vue';

const props = defineProps({
	player: {
		type: Object
	},
	teamName: {
		type: String
	},
	theme: {
		type: String
	},
	manyPlayers: {
		type: Boolean,
		default: false
	}
});

const flipped = ref(false);
const hasLoadedBack = ref(false);

const flipAriaLabel = computed(() => {
	const name = props.player?.person?.fullName || 'Player';
	return `Baseball card for ${name}. Press Enter or Space to flip between front and back.`;
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
</script>

<style scoped>
/*
 * Off-screen cards: skip layout/paint until near the viewport. If a browser
 * mis-composites 3D flips with this, remove .card__defer’s content-visibility.
 */
.card__defer {
	contain-intrinsic-block-size: 336px; /* ~5:6 at 280px max width */
	content-visibility: auto;
	max-width: 280px;
	width: 100%;
}

/* Card typography: var(--font-card) — see src/styles/tokens.css */
.card__scene {
	aspect-ratio: 5 / 6;
	border: 1px solid var(--color-border-card);
	border-radius: 10px;
	box-shadow: var(--shadow-card);
	font-family: var(--font-card);
	height: auto;
	max-width: 280px;
	perspective: 600px;
	position: relative;
	width: 100%;
}
.card__container {
	border-radius: 10px;
	cursor: pointer;
	height: 100%;
	transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	transform-style: preserve-3d;
	position: relative;
	width: 100%;
}

@media (prefers-reduced-motion: reduce) {
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
