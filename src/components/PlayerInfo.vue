<template>
	<div class="player__info" :class="theme">
		<player-team :position="player.Position" :team="player.Team" :theme="theme"></player-team>
		<div class="player__stat">
			<span class="player__height">ht: {{height}}</span>
			<span class="player__weight">wt: {{weight}}</span>
		</div>
		<div class="player__stat">
			<span class="player__bat">bats: {{batHand}}</span>
			<span class="player__throw">throws: {{throwHand}}</span>
		</div>
		<div class="player__stat">
			<span class="player__birthdate">born: {{birthday}},</span>
			<span class="player__birthcity" v-if="player.BirthCity">{{player.BirthCity}},</span>
			<span class="player__birthstate" v-if="player.BirthState">{{player.BirthState}},</span>
			<span class="player__birthcountry" v-if="player.BirthCountry">{{player.BirthCountry}}</span>
		</div>
	</div>
</template>

<script>
import PlayerTeam from './PlayerTeam';

export default {
	name: 'PlayerInfo',
	components: {
		PlayerTeam
	},
    props: {
        player: {
            type: Object
		},
		theme: {
			type: String
		}
	},
	computed: {
		batHand: function() {
			switch (this.player.BatHand) {
				case 'L':
					return 'left';
				case 'R':
					return 'right';
				case 'S':
					return 'both';
				default:
					return 'unknown';
			}
		},
		birthday: function() {
			if (!this.player.BirthDate) {
				return '?';
			}

			return this.player.BirthDate.split('T')[0];
		},
		height: function() {
			let feet,
				inches,
				message;

			if (!this.player.Height) {
				message = '?';
			} else {
				feet = Math.floor(this.player.Height/12);
				inches = this.player.Height - (feet * 12);
				message = `${feet}'${inches}"`;
			}

			return message;
		},
		throwHand: function() {
			switch (this.player.ThrowHand) {
				case 'L':
					return 'left';
				case 'R':
					return 'right';
				case 'S':
					return 'both';
				default:
					return '?';
			}
		},
		weight: function() {
			if (!this.player.Weight) {
				return '?';
			} else {
				return this.player.Weight;
			}
		}
	}
}
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
.player__info.chw,
.player__info.cin,
.player__info.col,
.player__info.mia,
.player__info.pit,
.player__info.sf {
	color: rgb(0, 0, 0);
}

.player__info.chc {
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

.player__info.kc {
	color: rgb(23, 72, 133);
}

.player__info.laa {
	color: rgb(0, 50, 99);
}

.player__info.lad {
	color: rgb(0, 90, 156);
}

.player__info.mil {
	color: rgb(26, 37, 80);
}

.player__info.min {
	color: rgb(26, 46, 90);
}

.player__info.nym {
	color: rgb(0, 45, 114);
}

.player__info.nyy {
	color: rgb(18, 36, 72);
}

.player__info.oak {
	color: rgb(1, 56, 49);
}

.player__info.phi {
	color: rgb(40, 73, 153);
}

.player__info.sd {
	color: rgb(30, 49, 96);
}

.player__info.sea {
	color: rgb(24, 45, 85);
}

.player__info.stl {
	color: rgb(34, 32, 95);
}

.player__info.tb {
	color: rgb(27, 47, 91);
}

.player__info.tex {
	color: rgb(35, 57, 116);
}

.player__info.tor {
	color: rgb(30, 46, 92);
}

.player__info.wsh {
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
