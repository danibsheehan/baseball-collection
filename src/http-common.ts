import axios, { getAdapter, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { cacheAdapterEnhancer } from 'axios-extensions';

const apiBase = import.meta.env.VITE_API_BASE || '';

const defaultAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig) =>
	getAdapter(axios.defaults.adapter, config)(config);

const http = axios.create({
	baseURL: apiBase || (typeof location !== 'undefined' ? location.origin : ''),
	adapter: cacheAdapterEnhancer(defaultAdapter)
});

export default http;
