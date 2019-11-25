<template>
		<div class="player__details" :class="theme">
			<span class="player__position" :class="theme">{{position}}</span>
			<span class="player__team">{{team}}</span>
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
		},
		theme: {
			type: String
		}
    }
}
</script>

<style scoped>
.player__details {
	border-bottom: 2px solid black;
	font-size: 14px;
	text-align: center;
	width: 100%;
}

.player__details.ari {
	border-color: rgb(227, 212, 173);
	color: rgb(167, 30, 49);
}

.player__details.atl {
	border-color: rgb(234, 170, 0);
	color: rgb(206, 31, 67);
}

.player__position {
	border-right: 1px solid black;
	margin-right: 5px;
	padding-right: 5px;
}

.player__position.ari {
	border-color:rgb(167, 30, 49);
}

.player__position.atl {
	border-color: rgb(206, 31, 67);
}
</style>