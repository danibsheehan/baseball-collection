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
			include: ['src/**/*.test.js', 'src/**/*.test.ts', 'lib/**/*.test.mjs'],
			coverage: {
				provider: 'v8',
				reporter: ['text', 'html', 'cobertura'],
				reportsDirectory: './coverage',
				// Only files loaded during tests; avoids failing on untested UI until tests grow.
				all: false,
				include: ['src/**/*.{js,ts,vue}', 'lib/**/*.{js,mjs,cjs}'],
				exclude: [
					'**/node_modules/**',
					'**/*.test.{js,ts}',
					'**/*.test.mjs',
					'src/main.js',
					'server.js',
					'scripts/**',
					'**/*.d.ts'
				],
				thresholds: {
					lines: 95,
					functions: 95,
					branches: 85,
					statements: 95
				}
			}
		},
		server: {
			proxy: {
				'/teams': { target: 'http://127.0.0.1:3000', changeOrigin: true },
				'/people': { target: 'http://127.0.0.1:3000', changeOrigin: true }
			}
		}
	};
});
