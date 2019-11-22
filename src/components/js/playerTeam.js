export default {
    name: 'PlayerTeam',
    props: {
        teamString: {
            type: String
        }
    },
    data: () => ({
        team: []
    }),
    mounted() {
        this.team = this.teamString.split('');
    }
}
