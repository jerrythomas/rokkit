import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			reporter: ['text', 'lcov'],
			all: true,
			include: ['src'],
			exclude: ['spec']
		}
	}
})
