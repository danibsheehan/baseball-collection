<template>
	<div class="card__name">
		<span class="card__name--full">{{ fullName }}</span>
	</div>
</template>

<script setup>
defineProps({
	fullName: {
		type: String
	}
});
</script>

<style scoped>
.card__name {
	color: var(--theme-heading, inherit);
	display: flex;
	flex-direction: column;
	margin: 15px 0 0;
	text-align: left;
	text-transform: uppercase;
	width: 100%;
}

.card__name--first {
	font-size: 16px;
	padding-left: 10%;
}

.card__name--full {
	font-size: 22px;
	font-weight: 700;
	letter-spacing: 1.5px;
	padding-left: 5%;
}
</style>
