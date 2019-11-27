<template>
	<div class="card__scene">
		<div class="card__container" @click="flipCard" v-bind:class="{ 'card__container--flipped': flipped }">
			<card-front :player="player" :theme="theme"></card-front>
			<card-back :player="player" :theme="theme"></card-back>
		</div>
	</div>
</template>

<script>
import CardBack from './CardBack';
import CardFront from './CardFront';

export default {
	name: 'BaseballCard',
	components: {
		CardBack,
		CardFront
	},
	props: {
		player: {
			type: Object
		}
	},
	data: () => ({
		theme: '',
		flipped: false
	}),
	mounted() {
		this.theme = this.player.Team.toLowerCase();
	},
	methods: {
		flipCard() {
			this.flipped = !this.flipped;
		}
	}
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
