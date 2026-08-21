import { test, expect } from '@playwright/test'

test('top nav has no separate Catalog item', async ({ page }) => {
	await page.goto('/app')
	const nav = page.locator('[data-site-nav]')
	// The /app entry point is labelled "Explore"; components live under it,
	// so there is no separate "Catalog" (or "Components") nav item.
	await expect(nav.getByText('Explore', { exact: true })).toBeVisible()
	await expect(nav.getByText('Catalog', { exact: true })).toHaveCount(0)
})

test('/app landing shows the catalog grid', async ({ page }) => {
	await page.goto('/app')
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
	await expect(page.locator('[data-catalog-tile]').first()).toBeVisible()
})

// /app/catalog used to be a 308 redirect to /app, standing in for a real route (#151).
// It is now the browse-first entry point: the same catalog grid, without the landing hero.
test('/app/catalog is a browse-first grid with no landing hero', async ({ page }) => {
	await page.goto('/app/catalog')

	// It stays on its own URL rather than bouncing to /app.
	await expect(page).toHaveURL(/\/app\/catalog$/)
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
	await expect(page.locator('[data-app-catalog="browse"]')).toBeVisible()

	// The hero is the landing entry point's, not browse's.
	await expect(page.locator('.welcome-hero')).toHaveCount(0)

	// Grouped by category, several groups deep.
	expect(await page.locator('[data-catalog-group]').count()).toBeGreaterThan(1)
})

test('/app/catalog lists every catalog demo, same as the landing grid', async ({ page }) => {
	await page.goto('/app/catalog')
	const browseTiles = await page.locator('[data-catalog-tile]').count()

	await page.goto('/app')
	const landingTiles = await page.locator('[data-catalog-tile]').count()

	// Both render the whole catalog — browse differs only by the hero. The floor makes this
	// non-vacuous: the catalog has 55 demos, so a broken grid rendering nothing would fail.
	expect(browseTiles).toBe(landingTiles)
	expect(browseTiles).toBeGreaterThanOrEqual(50)
})

test('a tile on /app/catalog navigates to its demo', async ({ page }) => {
	await page.goto('/app/catalog')
	await page.locator('button[title="Tabs"]').click()
	await expect(page).toHaveURL(/\/app\/tabs/)
	// The demo mounted, so the grid is gone.
	await expect(page.locator('[data-catalog-grid]')).toHaveCount(0)
})

test('/app landing keeps its hero and grid, unchanged', async ({ page }) => {
	await page.goto('/app')
	await expect(page.locator('.welcome-hero')).toBeVisible()
	await expect(page.locator('[data-app-catalog="landing"]')).toBeVisible()
	await expect(page.locator('[data-catalog-tile]').first()).toBeVisible()
})

test('clicking a tile mounts the demo, and Browse reaches the browse grid', async ({ page }) => {
	await page.goto('/app')
	await page.locator('button[title="Tabs"]').click()
	await expect(page).toHaveURL(/\/app\/tabs/)
	await expect(page.locator('[data-catalog-grid]')).toHaveCount(0)

	// The in-shell Browse affordance is what makes the route reachable.
	await page.locator('[data-app-browse-link]').click()
	await expect(page).toHaveURL(/\/app\/catalog$/)
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
	await expect(page.locator('.welcome-hero')).toHaveCount(0)
})

test('navigating back to /app from browse restores the hero', async ({ page }) => {
	// `browse` is module-level shell state, so setShellLanding has to clear it or the hero
	// stays hidden for the rest of the session.
	//
	// This MUST be a client-side navigation. page.goto() is a full page load, which
	// re-initialises the shell module to its `browse: false` default — so a goto-based
	// version of this test passes even with the reset deleted (verified). Clicking the
	// in-app nav link keeps the same JS context, which is the only way the stale-state bug
	// is reachable.
	await page.goto('/app/catalog')
	await expect(page.locator('.welcome-hero')).toHaveCount(0)

	await page.locator('[data-site-nav] a[href="/app"]').click()
	await expect(page).toHaveURL(/\/app$/)
	await expect(page.locator('.welcome-hero')).toBeVisible()
	await expect(page.locator('[data-app-catalog="landing"]')).toBeVisible()
})
