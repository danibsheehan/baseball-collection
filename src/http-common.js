import axios from 'axios';

const http = axios.create({
	baseURL: `https://api.sportsdata.io/v3/mlb/scores/json/`,
	params: {
		'key': process.env.VUE_APP_SPORTS_KEY
	}
});

export default http;
