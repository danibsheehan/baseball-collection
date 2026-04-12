import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'VITE_');
	const base = env.VITE_PUBLIC_PATH || '/';

	return {
		plugins: [vue()],
		base,
		test: {
			environment: 'node',
			include: ['src/**/*.test.js', 'src/**/*.test.ts', 'lib/**/*.test.mjs']
		},
		server: {
			proxy: {
				'/teams': { target: 'http://127.0.0.1:3000', changeOrigin: true },
				'/people': { target: 'http://127.0.0.1:3000', changeOrigin: true }
			}
		}
	};
});
