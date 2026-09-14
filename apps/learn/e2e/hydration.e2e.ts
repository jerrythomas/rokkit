import { test, expect, type Page } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * The pre-hydration dead-click window.
 *
 * SSR ships every control fully formed — visible, enabled, hit-testable — and
 * inert, because Svelte only attaches handlers (both the delegated root
 * listener and the per-element property) when it hydrates. Every actionability
 * check Playwright runs before dispatching a click is already satisfied by that
 * inert markup, so a click issued inside the window is silently swallowed and
 * the navigation it was supposed to trigger never happens. The assertion that
 * follows then times out on a page that looks perfectly correct.
 *
 * `/app` server-renders 330 catalog tiles, so its hydration window is wide
 * enough to lose that race roughly one full-suite run in three — see
 * docs/backlog/2026-09-14-flaky-components-catalog-e2e.md.
 *
 * These tests hold the window open on purpose so the flake is deterministic
 * rather than occasional, and so the marker that closes it cannot regress
 * unnoticed.
 */

const HYDRATION_DELAY_MS = 3_000

/**
 * Stall the client bundle so the pre-hydration window is observable.
 *
 * Matches every immutable chunk rather than the hashed entry filenames, so a
 * change to Vite's chunking can't quietly turn this into a no-op that always
 * passes.
 */
async function stallHydration(page: Page, ms = HYDRATION_DELAY_MS) {
	await page.route('**/_app/immutable/**/*.js', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, ms))
		await route.continue()
	})
}

test('a catalog tile passes every actionability check while still inert', async ({ page }) => {
	await stallHydration(page)
	// `commit` — the default `load` would wait on the very scripts being stalled.
	await page.goto('/app', { waitUntil: 'commit' })

	const tile = page.locator('button[title="Tabs"]')

	// This is the trap: nothing here distinguishes the SSR'd button from a live one.
	await expect(tile).toBeVisible()
	await expect(tile).toBeEnabled()

	// And the click goes nowhere, because there is no handler on it yet.
	await tile.click()
	await expect(page).toHaveURL(/\/app$/)
})

test('body carries no hydration marker until Svelte has hydrated', async ({ page }) => {
	await stallHydration(page)
	await page.goto('/app', { waitUntil: 'commit' })

	// The SSR document must not claim to be hydrated — otherwise waiting on the
	// marker would be waiting on nothing.
	await expect(page.locator('button[title="Tabs"]')).toBeVisible()
	await expect(page.locator('body')).not.toHaveAttribute('data-hydrated', 'true')

	// ...and it must acquire the marker once hydration finishes.
	await expect(page.locator('body')).toHaveAttribute('data-hydrated', 'true', {
		timeout: 15_000
	})
})

test('waiting for the marker makes the same click land', async ({ page }) => {
	// Same stalled bundle, same click, via the helper the suite actually calls —
	// so a regression in `gotoHydrated` itself fails here too.
	await stallHydration(page)
	await gotoHydrated(page, '/app')

	await page.locator('button[title="Tabs"]').click()
	await expect(page).toHaveURL(/\/app\/tabs/)
})
