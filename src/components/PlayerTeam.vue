<template>
		<div class="player__details">
			<span class="player__position">{{position}}</span>
			<span class="player__team">{{teamName}}</span>
		</div>
</template>

<script setup>
defineProps({
	position: {
		type: String
	},
	teamName: {
		type: String
	}
});
</script>

<style scoped>
.player__details {
	border-bottom: 2px solid var(--theme-details-border, black);
	color: var(--theme-details-text, inherit);
	font-size: 14px;
	letter-spacing: 2px;
	padding-bottom: 5px;
	text-align: center;
	width: 100%;
}

.player__position {
	border-right: 1px solid var(--theme-position-border, black);
	margin-right: 5px;
	padding-right: 5px;
}
</style>
