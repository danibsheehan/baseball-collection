<template>
	<div class="card__player--info">
		<span class="card__player--position">{{position}}</span>
		<span class="card__player--team">{{team}}</span>
	</div>
</template>

<script>
export default {
    name: 'PlayerTeam',
    props: {
        position: {
            type: String
        },
        team: {
            type: String
        }
    }
}
</script>

<style scoped>
.card__player--info {
	bottom: 3%;
	display: inline-block;
	font-size: 10px;
	position: absolute;
	right: 10%;
}

.card__player--position {
	border-right: 1px solid black;
	margin-right: 5px;
	padding-right: 5px;
	text-transform: uppercase;
}
</style>