import BaseballCard from '../components/BaseballCard';
import axios from "axios";

export default {
    name: 'app',
    components: {
        BaseballCard
    },
    data: () => ({
        images: []
    }),
    mounted() {
        this.images = [];
        axios.get(`https://api.unsplash.com/search/photos?query=baseball&per_page=30`, {
            headers: {
                Authorization: "Client-ID 1d074482b6ad4e653d02bc12cc9e29e024347095abcbba9e5ad6acfcda23ae4f",
                "Accept-Version": "v1"
            }
        })
        .then(response => {
            this.images = response.data.results;
        })
        .catch(() => {
            this.images = [];
        });
    }
}
