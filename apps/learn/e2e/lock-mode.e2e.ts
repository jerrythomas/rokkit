import { test, expect } from '@playwright/test'
import { goTo, setMode } from './helpers'

// The LockMode demo page — a thin shell page that mounts the locked regions.
// Both regions are rendered by the dynamic catalog loader in the /app layout.
const ROUTE = '/app/lock-mode'

// Wait for the dynamic demo component to mount. The /app layout lazy-loads the
// catalog component, so the locked regions appear a tick after navigation.
async function waitForDemo(page: import('@playwright/test').Page) {
	await page.waitForSelector('[data-testid="locked-dark"]', { timeout: 10_000 })
}

test('LockMode pins a region to dark inside a light page', async ({ page }) => {
	await goTo(page, ROUTE)
	await waitForDemo(page)

	// Put the page into light mode (setMode sets data-mode on <body>).
	await setMode(page, 'light')

	const lockedPaper = await page
		.getByTestId('locked-dark')
		.evaluate((el) => getComputedStyle(el).getPropertyValue('--paper').trim())

	const pagePaper = await page.evaluate(() =>
		getComputedStyle(document.body).getPropertyValue('--paper').trim()
	)

	// The locked-dark region must have a non-empty --paper value.
	expect(lockedPaper).not.toBe('')
	// The locked region's mode comes solely from the static data-mode="dark" on
	// the <LockMode> wrapper — --paper cascades into the inner [data-testid] div.
	// The app skin is dual-palette (kami for light, sumi for dark), so the dark
	// region's --paper (a sumi-ink tone) differs from the light page's --paper
	// (a kami paper white).
	expect(lockedPaper).not.toBe(pagePaper)
})

test('LockMode pins a region to light inside a dark page', async ({ page }) => {
	await goTo(page, ROUTE)
	await waitForDemo(page)

	// Put the page into dark mode (setMode sets data-mode on <body>).
	await setMode(page, 'dark')

	const lockedPaper = await page
		.getByTestId('locked-light')
		.evaluate((el) => getComputedStyle(el).getPropertyValue('--paper').trim())

	const pagePaper = await page.evaluate(() =>
		getComputedStyle(document.body).getPropertyValue('--paper').trim()
	)

	// The locked-light region must have a non-empty --paper value.
	expect(lockedPaper).not.toBe('')
	// The locked region's mode comes solely from the static data-mode="light" on
	// the <LockMode> wrapper — --paper cascades into the inner [data-testid] div.
	// The app skin is dual-palette, so the light region's --paper (a kami paper
	// white) differs from the dark page's --paper (a sumi-ink tone).
	expect(lockedPaper).not.toBe(pagePaper)
})
