import { defineConfig, devices } from '@playwright/test'

/**
 * rokkit's own port. `vite preview` defaults to 4173, which other projects on the same machine
 * use too (dbd's site does) — and with `reuseExistingServer` a run then silently tests
 * whichever app holds the port. `--strictPort` makes a clash fail loudly instead.
 */
const PORT = 4183

export default defineConfig({
	testDir: 'e2e',
	testMatch: /.*\.e2e\.ts/,
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	timeout: 30_000,
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01
		}
	},
	webServer: {
		command: `bun run build && bun run preview --port ${PORT} --strictPort`,
		port: PORT,
		/**
		 * Playwright's default is 60s, which is less than a cold build takes here — `bun run
		 * build` is `sync:assets && svelte-kit sync && vite build` and measures ~23s warm, more
		 * cold or under memory pressure. Over the default the whole run dies with
		 * "Timed out waiting 60000ms from config.webServer" before a single test executes,
		 * which reads as "the suite is broken" rather than "the build had not finished".
		 */
		timeout: 180_000,
		/**
		 * Reusing a server skips BOTH the build and the preview, so a preview left running from
		 * an earlier checkout serves stale code and the suite silently tests the wrong thing.
		 * Worth it for the local iterate loop, but it means: if results look impossible, kill
		 * the preview on PORT and re-run before believing them.
		 *
		 * Do NOT run `vite dev` at the same time. Both it and `vite build` run `sync:assets`,
		 * which `cp -r`s the same trees into `static/`, and `static/` is copied into the build —
		 * so a concurrent pair can produce a half-written artifact that loads but never
		 * hydrates, failing every test that waits for `data-hydrated`.
		 */
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: `http://localhost:${PORT}`
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1440, height: 900 }
			}
		}
	]
})
