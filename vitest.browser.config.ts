import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

/**
 * Browser-mode component tests — a real Chromium via Playwright.
 *
 * These exist for behaviour JSDOM structurally cannot express: anything that
 * reads real layout (clientWidth / offsetHeight / getBoundingClientRect all
 * report 0 in JSDOM), real hit-testing, or CSS-dependent state. The jsdom
 * suites stub that geometry, which proves the arithmetic but not that the
 * component measures the right box.
 *
 * Deliberately a separate config from vitest.config.ts so `bun run check`
 * stays hermetic and browser-free. Run with `bun run test:browser`.
 *
 * Convention: specs live in `packages/<pkg>/browser/` — outside the `spec/**`
 * glob the jsdom projects use, so the two suites can't pick up each other's
 * files.
 */
export default defineConfig({
	plugins: [svelte({ hot: false }), svelteTesting()],
	// Without this, `svelte` resolves to index-server.js and mount() throws
	// `lifecycle_function_unavailable` — the export conditions default to the
	// server build even though these tests run in a real browser.
	resolve: {
		conditions: ['browser', 'development', 'module', 'import', 'default']
	},
	test: {
		globals: true,
		include: ['packages/*/browser/**/*.spec.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/.worktrees/**'],
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			screenshotFailures: false,
			instances: [{ browser: 'chromium' }]
		}
	}
})
