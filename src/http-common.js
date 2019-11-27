import axios from 'axios';
import { cacheAdapterEnhancer } from 'axios-extensions';

const http = axios.create({
	baseURL: `https://api.sportsdata.io/v3/mlb/scores/json/`,
	params: {
		'key': process.env.VUE_APP_SPORTS_KEY
	},
	adapter: cacheAdapterEnhancer(axios.defaults.adapter)
});

export default http;
