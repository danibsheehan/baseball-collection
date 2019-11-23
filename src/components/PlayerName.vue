<template>
	<div class="card__name" :class="theme">
		<span class="card__name--last">{{lastName}}</span>
		<span class="card__name--first">{{firstName}}</span>
	</div>
</template>

<script src="./js/playerName.js"></script>

<style scoped>
	@import './css/playerName.css';
</style>
