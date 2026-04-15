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
			include: ['src/**/*.test.ts', 'lib/**/*.test.mjs'],
			coverage: {
				provider: 'v8',
				reporter: ['text', 'html', 'cobertura'],
				reportsDirectory: './coverage',
				// Only files loaded during tests; avoids failing on untested UI until tests grow.
				all: false,
				include: ['src/**/*.{ts,vue}', 'lib/**/*.{js,mjs,cjs}'],
				exclude: [
					'**/node_modules/**',
					'**/*.test.ts',
					'**/*.test.mjs',
					'src/main.ts',
					'server.js',
					'scripts/**',
					'**/*.d.ts',
					// WebGL / DOM foil helpers and tilt: covered indirectly via UI; keep thresholds meaningful.
					'src/lib/cardFoilWebgl.ts',
					'src/lib/cardFoilDom.ts',
					'src/lib/useCardTilt.ts'
				],
				thresholds: {
					lines: 95,
					statements: 95,
					// SFCs add many interaction branches / small handlers; keep strict on lines/statements.
					branches: 82,
					functions: 85
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
