<template>
	<button class="team" :class="theme" @click="searchPlayers">
		<span class="team__name" :class="theme">{{team.name}}</span>
		<span class="team__logo" :class="theme"></span>
	</button>
</template>

<script setup>
import { ref, computed } from 'vue';
import http from '../http-common';

const props = defineProps({
	team: {
		type: Object
	}
});

const emit = defineEmits(['updatePlayers', 'updateTeam']);

const players = ref([]);

const theme = computed(() => props.team.teamCode?.toLowerCase() || '');

function searchPlayers() {
	players.value = [];
	http.get(`teams/${props.team.id}/roster`)
		.then((response) => {
			const data = response.data.roster;
			players.value = data;
			emit('updatePlayers', players.value);
		})
		.catch(() => {
			players.value = [];
		});

	emit('updateTeam', props.team);
}
</script>

<style scoped>
.team {
	background-color: white;
	border: 1px solid black;
	font-size: 18px;
	font-weight: 250;
	height: 40px;
	padding: 10px;
	position: relative;
	width: 33%;
}

.team:focus {
	outline: none;
}

.team__logo,
.team__name {
	left: 50%;
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%);
}

.team__name {
	width: 100%;
}

.team__logo {
	background-image: url('../assets/mlb-logos-1.0.svg');
	display: none;
	padding-bottom: 30px;
	width: 30px;
}

.team__logo.ari {
	background-position: 0 0;
}

.team__logo.atl {
	background-position: -30px -30px;
}

.team__logo.bal {
	background-position: -60px -60px;
}

.team__logo.bos {
	background-position: -90px -90px;
}

.team__logo.cha {
	background-position: -150px -150px;
}

.team__logo.chn {
	background-position: -120px -120px;
}

.team__logo.cin {
	background-position: -180px -180px;
}

.team__logo.cle {
	background-position: -210px -210px;
}

.team__logo.col {
	background-position: -240px -240px;
}

.team__logo.det {
	background-position: -270px -270px;
}

.team__logo.hou {
	background-position: -300px -300px;
}

.team__logo.kca {
	background-position: -330px -330px;
}

.team__logo.ana {
	background-position: -360px -360px;
}

.team__logo.lan {
	background-position: -390px -390px;
}

.team__logo.mia {
	background-position: -420px -420px;
}

.team__logo.mil {
	background-position: -450px -450px;
}

.team__logo.min {
	background-position: -480px -480px;
}

.team__logo.nyn {
	background-position: -510px -510px;
}

.team__logo.nya {
	background-position: -540px -540px;
}

.team__logo.ath {
	background-position: -570px -570px;
}

.team__logo.phi {
	background-position: -600px -600px;
}

.team__logo.pit {
	background-position: -630px -630px;
}

.team__logo.sdn {
	background-position: -660px -660px;
}

.team__logo.sfn {
	background-position: -690px -690px;
}

.team__logo.sea {
	background-position: -720px -720px;
}

.team__logo.sln {
	background-position: -750px -750px;
}

.team__logo.tba {
	background-position: -780px -780px;
}

.team__logo.tex {
	background-position: -810px -810px;
}

.team__logo.tor {
	background-position: -840px -840px;
}

.team__logo.was {
	background-position: -870px -870px;
}

.team:hover .team__name {
	display: none;
}

.team:hover .team__logo {
	display: inline-block;
}

@media (max-width: 480px) {
	.team {
		font-size: 12px;
	}
}
</style>

