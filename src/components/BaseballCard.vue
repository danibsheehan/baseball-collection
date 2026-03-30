<template>
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
			/>
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
.card__scene {
	box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.6);
	font-family: 'Montserrat', sans-serif;
	height: 300px;
	margin: 15px;
	perspective: 600px;
	position: relative;
	width: 250px;
}
.card__container {
	cursor: pointer;
	height: 100%;
	transition: transform 1s;
	transform-style: preserve-3d;
	position: relative;
	width: 100%;
}

.card__container:focus {
	outline: none;
}

.card__container:focus-visible {
	box-shadow: 0 0 0 3px #fff, 0 0 0 5px #1a5f9e;
}

.card__container--flipped {
	transform: rotateY(180deg);
}
</style>
