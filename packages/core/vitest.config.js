import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'lcov'],
			all: false,
			include: ['src'],
			exclude: ['src/**/*.spec.js', 'src/mocks/**/*']
		}
	}
})
