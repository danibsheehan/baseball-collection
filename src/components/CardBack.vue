<template>
	<div class="card">
		<div class="card__container--back">
			Hello
		</div>
	</div>
</template>

<script>
export default {
	name: 'CardBack',
	props: {
		player: {
			type: Object
		}
	}
}
</script>

<style scoped>
.card {
	background-color: red;
	backface-visibility: hidden;
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	transform: rotateY( 180deg );
	width: 100%;
}

.card__container--back {
	height: 100%;
}
</style>
