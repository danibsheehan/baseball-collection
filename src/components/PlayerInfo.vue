<template>
	<div class="player__info" :class="theme" v-if="playerInfo">
		<PlayerTeam :position="playerInfo.primaryPosition?.name" :theme="theme" :teamName="teamName" />
		<div class="player__stat">
			<span class="player__height">ht: {{playerInfo.height}}</span>
			<span class="player__weight">wt: {{playerInfo.weight}}</span>
		</div>
		<div class="player__stat">
			<span class="player__bat">bats: {{playerInfo.batSide?.description}}</span>
			<span class="player__throw">throws: {{playerInfo.pitchHand?.description}}</span>
		</div>
		<div class="player__stat">
			<span class="player__birthdate">born: {{playerInfo.birthDate}},</span>
			<span class="player__birthcity" v-if="playerInfo.birthCity">{{playerInfo.birthCity}},</span>
			<span class="player__birthstate" v-if="playerInfo.birthStateProvince">{{playerInfo.birthStateProvince}},</span>
			<span class="player__birthcountry" v-if="playerInfo.birthCountry">{{playerInfo.birthCountry}}</span>
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
	},
	theme: {
		type: String
	}
});
</script>

<style scoped>
.player__info {
	background-color: rgb(242, 247, 245);
	box-shadow: 0 10px 10px 0 rgba(0, 0, 0, .5), 0 -10px 10px 0 rgba(0, 0, 0, .5);
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

.player__info.atl {
	color: rgb(22, 40, 79);
}

.player__info.bos {
	color: rgb(25, 44, 85);
}

.player__info.ari,
.player__info.bal,
.player__info.cha,
.player__info.cin,
.player__info.col,
.player__info.mia,
.player__info.pit,
.player__info.sfn {
	color: rgb(0, 0, 0);
}

.player__info.chn {
	color: rgb(39, 59, 129);
}

.player__info.cle {
	color: rgb(26, 46, 90);
}

.player__info.det {
	color: rgb(24, 45, 85);
}

.player__info.hou {
	color: rgb(30, 49, 96);
}

.player__info.kca {
	color: rgb(23, 72, 133);
}

.player__info.ana {
	color: rgb(0, 50, 99);
}

.player__info.lan {
	color: rgb(0, 90, 156);
}

.player__info.mil {
	color: rgb(26, 37, 80);
}

.player__info.min {
	color: rgb(26, 46, 90);
}

.player__info.nyn {
	color: rgb(0, 45, 114);
}

.player__info.nya {
	color: rgb(18, 36, 72);
}

.player__info.ath {
	color: rgb(1, 56, 49);
}

.player__info.phi {
	color: rgb(40, 73, 153);
}

.player__info.sdn {
	color: rgb(30, 49, 96);
}

.player__info.sea {
	color: rgb(24, 45, 85);
}

.player__info.sln {
	color: rgb(34, 32, 95);
}

.player__info.tba {
	color: rgb(27, 47, 91);
}

.player__info.tex {
	color: rgb(35, 57, 116);
}

.player__info.tor {
	color: rgb(30, 46, 92);
}

.player__info.was {
	color: rgb(33, 39, 89);
}

.player__stat {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around;
	margin: 0 auto;
	width: 85%;
}

.player__birthcity,
.player__birthcountry,
.player__birthdate,
.player__birthstate {
	margin: 0 2px;
}
</style>
