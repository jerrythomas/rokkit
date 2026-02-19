import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import path from 'path'

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST }), svelteTesting()],
	optimizeDeps: {
		include: ['bits-ui']
	},
	ssr: {
		noExternal: ['bits-ui']
	},
	resolve: {
		alias: {
			// Handle $lib alias for sites/learn tests
			$lib: path.resolve('./sites/learn/src/lib'),
			// Handle other potential aliases
			$app: path.resolve('./sites/learn/src/app')
		}
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['**/*.{spec,spec.svelte}.[jt]s'],
		exclude: ['**/node_modules/**', '**/dist/**', 'archive/**', 'packages/ui/spec/**'],
		coverage: {
			all: true,
			reporter: ['text', 'html', 'lcov', 'json'],
			include: ['**/src/**'],
			exclude: ['**/spec/**', '**/node_modules/**', '**/dist/**', '**/sites/**', '**/fixtures/**']
		}
	}
})
