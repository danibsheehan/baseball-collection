import BaseballCard from '../BaseballCard';
import axios from "axios";

export default {
    name: 'app',
    components: {
        BaseballCard
    },
    data: () => ({
        players: []
    }),
    mounted() {
        this.players = [];
        axios.get(`https://api.sportsdata.io/v3/mlb/scores/json/Players/ATL?key=a5ab22c5a0e3407c9cc72de8ec2561ae`)
        .then(response => {
            this.players = response.data.filter(player => player.Status === 'Active');
        })
        .catch(() => {
            this.players = [];
        });
    }
}
