<template>
	<div class="card__team">
		<div class="card__team--letter" v-for="(letter, i) in team" :key="i">{{letter}}</div>
	</div>
</template>

<script src="./js/playerTeam.js"></script>

<style scoped>
	@import './css/playerTeam.css';
</style>