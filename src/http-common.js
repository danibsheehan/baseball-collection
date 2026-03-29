import axios, { getAdapter } from 'axios';
import { cacheAdapterEnhancer } from 'axios-extensions';

const apiBase = process.env.VUE_APP_API_BASE || '';

// Axios 1.x uses adapter name list on defaults, not a single function; cacheAdapterEnhancer needs a callable.
const defaultAdapter = (config) =>
	getAdapter(axios.defaults.adapter, config)(config);

const http = axios.create({
	baseURL: apiBase || (typeof location !== 'undefined' ? location.origin : ''),
	adapter: cacheAdapterEnhancer(defaultAdapter)
});

export default http;
