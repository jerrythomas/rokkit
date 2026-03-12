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
		exclude: ['**/node_modules/**', '**/dist/**', '**/.worktrees/**'],
		coverage: {
			all: true,
			reporter: ['text', 'html', 'lcov', 'json'],
			include: ['**/src/**'],
			exclude: [
				'**/spec/**',
				'**/node_modules/**',
				'**/dist/**',
				'**/site/**',
				'**/fixtures/**',
				'**/types.ts',
				'**/.worktrees/**'
			]
		},
		projects: [
			{ extends: true, test: { name: 'actions', root: 'packages/actions' } },
			{ extends: true, test: { name: 'chart', root: 'packages/chart' } },
			{ extends: true, test: { name: 'cli', root: 'packages/cli' } },
			{ extends: true, test: { name: 'core', root: 'packages/core' } },
			{ extends: true, test: { name: 'unocss', root: 'packages/unocss' } },
			{ extends: true, test: { name: 'data', root: 'packages/data' } },
			{ extends: true, test: { name: 'forms', root: 'packages/forms' } },
			{ extends: true, test: { name: 'helpers', root: 'packages/helpers' } },
			{
				extends: true,
				test: { name: 'states', root: 'packages/states', setupFiles: ['spec/setup.js'] }
			},
			{ extends: true, test: { name: 'stories', root: 'packages/stories' } },
			{ extends: true, test: { name: 'tutorial', root: 'packages/tutorial' } },
			{
				extends: true,
				test: { name: 'ui', root: 'packages/ui', setupFiles: ['../helpers/src/mocks/index.js'] }
			},
			{
				extends: true,
				test: {
					name: 'learn',
					root: 'site'
				},
				resolve: {
					alias: {
						$lib: path.resolve('./site/src/lib'),
						$app: path.resolve('./site/src/app')
					}
				}
			}
		]
	}
})
