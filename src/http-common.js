import axios from 'axios';
import { cacheAdapterEnhancer } from 'axios-extensions';

const http = axios.create({
	baseURL: location.origin,
	adapter: cacheAdapterEnhancer(axios.defaults.adapter)
});

export default http;
