import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST }), svelteTesting()],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			reporter: ['text', 'html', 'lcov'],
			all: true,
			include: ['src'],
			exclude: ['spec']
		}
	}
})
