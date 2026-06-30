import { test, expect } from '@playwright/test'

test('top nav has no separate Catalog item', async ({ page }) => {
	await page.goto('/app')
	const nav = page.locator('[data-site-nav]')
	await expect(nav.getByText('Components', { exact: true })).toBeVisible()
	await expect(nav.getByText('Catalog', { exact: true })).toHaveCount(0)
})

test('/app landing shows the catalog grid', async ({ page }) => {
	await page.goto('/app')
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
	await expect(page.locator('[data-catalog-tile]').first()).toBeVisible()
})

test('/app/catalog redirects to /app', async ({ page }) => {
	await page.goto('/app/catalog')
	await expect(page).toHaveURL(/\/app$/)
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
})

test('clicking a tile mounts the demo, and Browse returns to the grid', async ({ page }) => {
	await page.goto('/app')
	await page.locator('button[title="Tabs"]').click()
	await expect(page).toHaveURL(/\/app\/tabs/)
	await expect(page.locator('[data-catalog-grid]')).toHaveCount(0)
	await page.locator('a.chat-browse').click()
	await expect(page).toHaveURL(/\/app$/)
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
})
