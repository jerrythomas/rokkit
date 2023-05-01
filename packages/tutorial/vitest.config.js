import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'

export default defineConfig({
	plugins: [
		svelte({
			hot: !process.env.VITEST,
			extensions: ['.svelte', '.svx'],
			preprocess: mdsvex({
				extensions: ['.svx']
			})
		})
	],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			reporter: ['text', 'lcov'],
			all: false,
			include: ['src'],
			exclude: ['src/**/*.spec.js']
		}
	}
})