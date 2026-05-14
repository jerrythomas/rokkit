import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['spec/**/*.spec.{ts,svelte.ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./spec/setup.ts']
	}
})
