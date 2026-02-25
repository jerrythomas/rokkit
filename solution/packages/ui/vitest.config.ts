import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['spec/**/*.spec.svelte.{js,ts}'],
		browser: {
			enabled: true,
			provider: 'playwright',
			name: 'chromium',
			headless: true
		},
		setupFiles: ['./spec/setup.ts']
	}
})
