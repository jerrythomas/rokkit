import { test, expect } from '@playwright/test'

// The guide reading pane is an inner scroll container (<main id="guides-main">).
// SvelteKit restores window scroll, not inner containers, so its scroll position
// used to carry over between guides. It must reset to the top on a page switch.
test('guide reading pane scroll resets on switching guides', async ({ page }) => {
	await page.goto('/guides/charts')
	const main = page.locator('#guides-main')
	await expect(main).toBeVisible()

	// Scroll the reading pane down — the charts guide is long enough to scroll.
	await main.evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
	expect(await main.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)

	// Client-side navigate to a different guide via the rail.
	await page.locator('.rail a:not(.active)').first().click()
	await expect(page).not.toHaveURL(/\/guides\/charts$/)

	// The reading pane is back at the top.
	await expect.poll(() => main.evaluate((el) => el.scrollTop)).toBe(0)
})
