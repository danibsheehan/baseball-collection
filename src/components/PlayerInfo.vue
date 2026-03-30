<template>
	<div class="player__info" v-if="playerInfo">
		<PlayerTeam :position="playerInfo.primaryPosition?.name" :teamName="teamName" />
		<div class="player__stat">
			<span class="player__height">ht: {{playerInfo.height}}</span>
			<span class="player__weight">wt: {{playerInfo.weight}}</span>
		</div>
		<div class="player__stat">
			<span class="player__bat">bats: {{playerInfo.batSide?.description}}</span>
			<span class="player__throw">throws: {{playerInfo.pitchHand?.description}}</span>
		</div>
		<div class="player__stat">
			<span class="player__birthdate">born: {{playerInfo.birthDate}}</span>
			<div class="player__birthplace">
				<span class="player__birthcity" v-if="playerInfo.birthCity">{{playerInfo.birthCity}},</span>
				<span class="player__birthstate" v-if="playerInfo.birthStateProvince">{{playerInfo.birthStateProvince}},</span>
				<span class="player__birthcountry" v-if="playerInfo.birthCountry">{{playerInfo.birthCountry}}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import PlayerTeam from './PlayerTeam.vue';

defineProps({
	playerInfo: {
		type: Object
	},
	teamName: {
		type: String
	}
});
</script>

<style scoped>
.player__info {
	background-color: rgb(242, 247, 245);
	box-shadow: 0 10px 10px 0 rgba(0, 0, 0, .5), 0 -10px 10px 0 rgba(0, 0, 0, .5);
	color: var(--theme-heading, inherit);
	display: flex;
	flex-direction: column;
	font-size: 12px;
	justify-content: space-around;
	height: 200px;
	left: 50%;
	position: absolute;
	text-transform: uppercase;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 225px;
}

.player__stat {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around;
	margin: 0 auto;
	width: 85%;
}

.player__birthplace {
	text-transform: center;
}
</style>
