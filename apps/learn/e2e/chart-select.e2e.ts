import { test, expect } from '@playwright/test'

// The old click-to-select "Metrics" showcase is gone; ChartExplorer does not
// wire point selection. This guards the live selection the explorer DOES have:
// exclusive chart-type selection driving the canvas, and an interactive setting
// toggle that re-renders without breaking. Controls live behind the tweak drawer.
test('selecting a chart type is exclusive and drives the canvas geom', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	// Default type is bar.
	await expect(page.locator('[data-chart-type="bar"]')).toHaveAttribute('data-active', 'true')

	// Select line — its chip activates, bar deactivates, and the canvas swaps geom.
	await page.locator('[data-chart-type="line"]').click()
	await expect(page.locator('[data-chart-type="line"]')).toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-chart-type="bar"]')).not.toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-plot-geom="line"]').first()).toBeAttached()
	await expect(page.locator('[data-plot-geom="bar"]')).toHaveCount(0)
})

test('toggling a live setting stays interactive and keeps the canvas rendering', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	// Bar applies the 'legend' setting (default off) — a checkbox row.
	const legendRow = page.locator('[data-chart-controls] label.row.check', { hasText: 'Show legend' })
	const legend = legendRow.locator('input[type="checkbox"]')
	await legend.click()
	await expect(legend).toBeChecked()

	// The bar geom still renders after the setting change.
	expect(await page.locator('[data-plot-element="bar"]').count()).toBeGreaterThan(0)
})
