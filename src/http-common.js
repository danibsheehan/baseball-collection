import axios from 'axios';
import { cacheAdapterEnhancer } from 'axios-extensions';

const apiBase = process.env.VUE_APP_API_BASE || '';

const http = axios.create({
	baseURL: apiBase || (typeof location !== 'undefined' ? location.origin : ''),
	adapter: cacheAdapterEnhancer(axios.defaults.adapter)
});

export default http;
