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
	letter-spacing: 2px;
	padding-bottom: 5px;
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

.player__details.bal {
	border-color: rgb(162, 170, 173);
	color: rgb(221, 73, 38);
}

.player__details.bos {
	border-color: rgb(189, 49, 57);
	color: rgb(189, 49, 57);
}

.player__details.chc {
	border-color: rgb(204, 52, 51);
	color: rgb(204, 52, 51);
}

.player__details.chw {
	border-color: rgb(196, 206, 211);
	color: rgb(0, 0, 0);
}

.player__details.cin {
	border-color: rgb(198, 33, 39);
	color: rgb(0, 0, 0);
}

.player__details.cle {
	border-color: rgb(226, 29, 56);
	color: rgb(26, 46, 90);
}

.player__details.col {
	border-color: rgb(196, 206, 211);
	color: rgb(55, 36, 107);
}

.player__details.det {
	border-color: rgb(242, 103, 34);
	color: rgb(24, 45, 85);
}

.player__details.hou {
	border-color: rgb(187, 188, 188);
	color: rgb(234, 110, 36);
}

.player__details.kc {
	border-color: rgb(192, 153, 90);
	color: rgb(123, 178, 221);
}

.player__details.laa {
	border-color: rgb(134, 38, 51);
	color: rgb(186, 0, 33);
}

.player__details.lad {
	border-color: rgb(239, 62, 66);
	color: rgb(0, 90, 156);
}

.player__details.mia {
	border-color: rgb(242, 103, 34);
	color: rgb(30, 118, 189);
}

.player__details.mil {
	border-color: rgb(181, 146, 47);
	color: rgb(26, 37, 80);
}

.player__details.min {
	border-color: rgb(207, 172, 122);
	color: rgb(211, 30, 71);
}

.player__details.nym {
	border-color: rgb(255, 89, 16);
	color: rgb(0, 45, 114);
}

.player__details.nyy {
	border-color: rgb(196, 206, 211);
	color: rgb(18, 36, 72);
}

.player__details.oak {
	border-color: rgb(238, 178, 30);
	color: rgb(1, 56, 49);
}

.player__details.phi {
	border-color: rgb(231, 29, 42);
	color: rgb(40, 73, 153);
}

.player__details.pit {
	border-color: rgb(253, 183, 36);
	color: rgb(0, 0, 0);
}

.player__details.sd {
	border-color: rgb(30, 49, 96);
	color: rgb(30, 49, 96);
}

.player__details.sf {
	border-color: rgb(139, 111, 78);
	color: rgb(241, 91, 40);
}

.player__details.sea {
	border-color: rgb(196, 206, 211);
	color: rgb(2, 93, 93);
}

.player__details.stl {
	border-color: rgb(253, 218, 0);
	color: rgb(196, 32, 59);
}

.player__details.tb {
	border-color: rgb(245, 209, 49);
	color: rgb(144, 188, 228);
}

.player__details.tex {
	border-color: rgb(192, 33, 38);
	color: rgb(35, 57, 116);
}

.player__details.tor {
	border-color: rgb(231, 44, 37);
	color: rgb(18, 75, 141);
}

.player__details.wsh {
	border-color: rgb(170, 30, 34);
	color: rgb(33, 39, 89);
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

.player__position.bal {
	border-color: rgb(221, 73, 38);
}

.player__position.bos {
	border-color: rgb(189, 49, 57);
}

.player__position.chc {
	border-color: rgb(204, 52, 51);
}

.player__position.chw,
.player__position.cin {
	border-color: rgb(0, 0, 0);
}

.player__position.cle {
	border-color: rgb(26, 46, 90);
}

.player__position.col {
	border-color: rgb(55, 36, 107);
}

.player__position.det {
	border-color: rgb(24, 45, 85);
}

.player__position.hou {
	border-color: rgb(234, 110, 36);
}

.player__position.kc {
	border-color: rgb(123, 178, 221);
}

.player__position.laa {
	border-color: rgb(186, 0, 33);
}

.player__position.lad {
	border-color: rgb(0, 90, 156);
}

.player__position.mia {
	border-color: rgb(30, 118, 189);
}

.player__position.mil {
	border-color: rgb(26, 37, 80);
}

.player__position.min {
	border-color: rgb(211, 30, 71);
}

.player__position.nym {
	border-color: rgb(0, 45, 114);
}

.player__position.nyy {
	border-color: rgb(18, 36, 72);
}

.player__position.oak {
	border-color: rgb(1, 56, 49);
}

.player__position.phi {
	border-color: rgb(40, 73, 153);
}

.player__position.pit {
	border-color: rgb(0, 0, 0);
}

.player__position.sd {
	border-color: rgb(30, 49, 96);
}

.player__position.sf {
	border-color: rgb(241, 91, 40);
}

.player__position.sea {
	border-color: rgb(2, 93, 93);
}

.player__position.stl {
	border-color: rgb(196, 32, 59);
}

.player__position.tb {
	border-color: rgb(144, 188, 228);
}

.player__position.tex {
	border-color: rgb(35, 57, 116);
}

.player__position.tor {
	border-color: rgb(18, 75, 141);
}

.player__position.wsh {
	border-color: rgb(33, 39, 89);
}
</style>
