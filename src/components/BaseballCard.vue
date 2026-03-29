<template>
	<div class="card__scene">
		<div class="card__container" @click="flipCard" v-bind:class="{ 'card__container--flipped': flipped }">
			<CardFront :player="player" :theme="theme" />
			<CardBack :player="player" :theme="theme" :teamName="teamName" />
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import CardBack from './CardBack.vue';
import CardFront from './CardFront.vue';

defineProps({
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

function flipCard() {
	flipped.value = !flipped.value;
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

.card__container--flipped {
	transform: rotateY(180deg);
}
</style>
