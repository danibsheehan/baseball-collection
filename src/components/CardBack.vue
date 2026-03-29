<template>
	<div class="card">
		<div class="card__container--back">
			<PlayerLogo :theme="theme" />
			<PlayerInfo :playerInfo="playerInfo" :theme="theme" :teamName="teamName" />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PlayerInfo from './PlayerInfo.vue';
import PlayerLogo from './PlayerLogo.vue';
import http from '../http-common';

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

const playerInfo = ref({});

onMounted(() => {
	http.get(`people/${props.player.person.id}`)
		.then((response) => {
			playerInfo.value = response.data.people[0];
		})
		.catch((err) => {
			console.error('player request failed', err);
			playerInfo.value = {};
		});
});
</script>

<style scoped>
.card {
	background: url('../assets/baseballs.jpg') center/cover;
	background-color: rgba(242, 247, 245, .5);
	backface-visibility: hidden;
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	transform: rotateY(180deg);
	width: 100%;
}

.card__container--back {
	height: 100%;
}

.card__container--back .card__logo {
	background-color: rgba(242, 247, 245, .5);
	left: 5px;
	top: 5px;
}
</style>
