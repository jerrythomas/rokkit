import { test, expect } from '@playwright/test'
import { goTo } from './helpers'

// The LockMode demo page — a thin shell page that mounts the locked regions.
// Both regions are rendered by the dynamic catalog loader in the /app layout.
const ROUTE = '/app/lock-mode'

// Wait for the dynamic demo component to mount (the /app layout lazy-loads
// the catalog component; the MutationObserver in lockMode fires on mount).
async function waitForDemo(page: import('@playwright/test').Page) {
	// The demo component is loaded dynamically; wait for either testid to appear.
	await page.waitForSelector('[data-testid="locked-dark"]', { timeout: 10_000 })
	// Extra tick for the lockMode $effect + MutationObserver to run.
	await page.waitForTimeout(300)
}

test('LockMode pins a region to dark inside a light page', async ({ page }) => {
	await goTo(page, ROUTE)
	await waitForDemo(page)

	// Drive the page into light mode (sets data-mode on both body and
	// documentElement so vibe + lockMode observer both see the same value).
	await page.evaluate(() => {
		document.body.setAttribute('data-mode', 'light')
		document.documentElement.setAttribute('data-mode', 'light')
	})
	await page.waitForTimeout(300)

	const lockedPaper = await page
		.getByTestId('locked-dark')
		.evaluate((el) => getComputedStyle(el).getPropertyValue('--paper').trim())

	const pagePaper = await page.evaluate(() =>
		getComputedStyle(document.body).getPropertyValue('--paper').trim()
	)

	// The locked-dark region must have a non-empty --paper value
	expect(lockedPaper).not.toBe('')
	// The app skin is dual-palette (kami for light, sumi for dark), so the dark
	// region's --paper (a sumi-ink tone) must differ from the page's --paper
	// (a kami paper white).
	expect(lockedPaper).not.toBe(pagePaper)
})

test('LockMode pins a region to light inside a dark page', async ({ page }) => {
	await goTo(page, ROUTE)
	await waitForDemo(page)

	// Drive the page into dark mode.
	await page.evaluate(() => {
		document.body.setAttribute('data-mode', 'dark')
		document.documentElement.setAttribute('data-mode', 'dark')
	})
	await page.waitForTimeout(300)

	const lockedPaper = await page
		.getByTestId('locked-light')
		.evaluate((el) => getComputedStyle(el).getPropertyValue('--paper').trim())

	const pagePaper = await page.evaluate(() =>
		getComputedStyle(document.body).getPropertyValue('--paper').trim()
	)

	// The locked-light region must have a non-empty --paper value
	expect(lockedPaper).not.toBe('')
	// The app skin is dual-palette (kami for light, sumi for dark), so the light
	// region's --paper (a kami paper white) must differ from the dark page's --paper
	// (a sumi-ink tone).
	expect(lockedPaper).not.toBe(pagePaper)
})
