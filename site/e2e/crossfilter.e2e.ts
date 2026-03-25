import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Demo layout:
//   [data-cf-demo-filters]  — FilterBar (class, count) + FilterSlider (hwy range)
//   [data-cf-demo-chart]    — main BarChart (class × mean hwy)
// FilterBar has 7 class categories → 7 bars

test.describe('CrossFilter playground', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'crossfilter')
	})

	test('renders the FilterBar with 7 category bars', async ({ page }) => {
		const filterBars = page
			.locator('[data-cf-demo-filters] [data-plot-element="bar"]')
		await expect(filterBars.first()).toBeVisible()
		const count = await filterBars.count()
		expect(count).toBe(7)
	})

	test('renders the main BarChart with 7 bars', async ({ page }) => {
		const mainBars = page
			.locator('[data-cf-demo-chart] [data-plot-element="bar"]')
		await expect(mainBars.first()).toBeVisible()
		const count = await mainBars.count()
		expect(count).toBe(7)
	})

	test('no bars are dimmed initially', async ({ page }) => {
		const dimmed = page.locator('[data-dimmed]')
		await expect(dimmed).toHaveCount(0)
	})

	test('clicking a FilterBar bar dims the non-selected bars in both charts', async ({ page }) => {
		const filterBars = page.locator('[data-cf-demo-filters] [data-plot-element="bar"]')
		await filterBars.first().click()
		await page.waitForTimeout(100)

		// After selecting 1 category: 6 FilterBar bars should be dimmed
		const dimmedFilterBars = page.locator('[data-cf-demo-filters] [data-plot-element="bar"][data-dimmed]')
		await expect(dimmedFilterBars).toHaveCount(6)

		// Main BarChart bars excluded from the filter should also be dimmed
		const dimmedMainBars = page.locator('[data-cf-demo-chart] [data-plot-element="bar"][data-dimmed]')
		const dimmedCount = await dimmedMainBars.count()
		expect(dimmedCount).toBeGreaterThan(0)
	})

	test('clicking the same bar again clears the filter and removes all dimming', async ({ page }) => {
		const filterBars = page.locator('[data-cf-demo-filters] [data-plot-element="bar"]')
		// Click to filter in
		await filterBars.first().click()
		await page.waitForTimeout(100)
		// Click again to remove filter
		await filterBars.first().click()
		await page.waitForTimeout(100)

		const dimmed = page.locator('[data-dimmed]')
		await expect(dimmed).toHaveCount(0)
	})

	test('FilterBar bars have pointer cursor (filterable)', async ({ page }) => {
		const bar = page.locator('[data-cf-demo-filters] [data-plot-element="bar"]').first()
		const cursor = await bar.evaluate((el) => window.getComputedStyle(el).cursor)
		expect(cursor).toBe('pointer')
	})

	test('renders the FilterSlider with range handle', async ({ page }) => {
		const slider = page.locator('[data-cf-demo-filters] [data-filter-slider]')
		await expect(slider).toBeVisible()
	})

	test('CrossFilter wrapper is present', async ({ page }) => {
		await expect(page.locator('[data-crossfilter]')).toBeVisible()
	})
})
