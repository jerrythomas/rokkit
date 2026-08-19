import { test, expect } from '@playwright/test'

// /app/chart mounts the live ChartExplorer (default type='bar'). Guards that the
// canvas renders a geom + grid, and that switching type via the tweak drawer
// re-renders the corresponding geom.
//
// Grid lines are axis-aligned stroke-only SVG shapes — their bounding box is 1px
// thick in one dimension, which Chromium/Playwright's toBeVisible() reports as
// "not visible" even though they are attached and painted. So presence is
// asserted via toBeAttached() + a positive count. Filled shapes (bars) pass
// toBeVisible() fine.
test('chart explorer renders the default bar geom with a grid', async ({ page }) => {
	await page.goto('/app/chart')

	await expect(page.locator('[data-plot-explorer-chart]')).toBeVisible()
	await expect(page.locator('[data-plot-geom="bar"]').first()).toBeVisible()
	expect(await page.locator('[data-plot-element="bar"]').count()).toBeGreaterThan(0)

	const grid = page.locator('[data-plot-grid-line]')
	await expect(grid.first()).toBeAttached()
	expect(await grid.count()).toBeGreaterThan(0)
})

// The chart-type chips live in ChartControls, which only renders inside the tweak
// slab — so we open it via the composer toggle before selecting a type.
test('switching chart type via the tweak drawer re-renders the geom', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	await page.locator('[data-chart-type="line"]').click()
	await expect(page.locator('[data-chart-type="line"]')).toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-plot-geom="line"]').first()).toBeAttached()

	await page.locator('[data-chart-type="area"]').click()
	await expect(page.locator('[data-plot-geom="area"]').first()).toBeAttached()
})

// Composition types wrap the geoms differently: FacetPlot (small multiples) and
// AnimatedPlot (tweened frames), selectable from the same type picker.
test('composition types (facet, animated) render in the explorer', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	await page.locator('[data-chart-type="facet"]').click()
	await expect(page.locator('[data-chart-type="facet"]')).toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-facet-panel]').first()).toBeAttached()

	await page.locator('[data-chart-type="animated"]').click()
	await expect(page.locator('[data-chart-type="animated"]')).toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-plot-geom="bar"]').first()).toBeAttached()
})
