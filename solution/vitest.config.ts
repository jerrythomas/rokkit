import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import path from 'path'

export default defineConfig({
	plugins: [
		svelte({
			hot: false
		}),
		svelteTesting()
	],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['spec/**/*.{spec,spec.svelte}.[jt]s', 'src/**/*.{spec,spec.svelte}.[jt]s'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		coverage: {
			all: true,
			reporter: ['text', 'html', 'lcov', 'json'],
			include: ['**/src/**'],
			exclude: ['**/spec/**', '**/node_modules/**', '**/dist/**', '**/sites/**', '**/fixtures/**', '**/types.ts']
		},
		projects: [
			{ extends: true, test: { name: 'actions', root: 'packages/actions' } },
			{ extends: true, test: { name: 'chart', root: 'packages/chart' } },
			{ extends: true, test: { name: 'cli', root: 'packages/cli' } },
			{ extends: true, test: { name: 'core', root: 'packages/core' } },
			{ extends: true, test: { name: 'data', root: 'packages/data' } },
			{ extends: true, test: { name: 'forms', root: 'packages/forms' } },
			{ extends: true, test: { name: 'helpers', root: 'packages/helpers' } },
			{ extends: true, test: { name: 'states', root: 'packages/states' } },
			{ extends: true, test: { name: 'stories', root: 'packages/stories' } },
			{ extends: true, test: { name: 'tutorial', root: 'packages/tutorial' } },
			{ extends: true, test: { name: 'ui', root: 'packages/ui' } },
			{
				extends: true,
				test: {
					name: 'learn',
					root: 'sites/learn'
				},
				resolve: {
					alias: {
						$lib: path.resolve('./sites/learn/src/lib'),
						$app: path.resolve('./sites/learn/src/app')
					}
				}
			},
			{ extends: true, test: { name: 'testbed', root: 'packages/testbed' } }
		]
	}
})
