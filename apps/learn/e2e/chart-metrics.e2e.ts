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

// #150 — a quadrant scatter crosses the axes at a chosen data origin (BCG matrix),
// placed by the shared coordinate layer: the y-axis shifts off the left edge.
test('quadrant type crosses the axes at the data origin', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	await page.locator('[data-chart-type="quadrant"]').click()
	await expect(page.locator('[data-chart-type="quadrant"]')).toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-plot-geom="point"]').first()).toBeAttached()

	// The y-axis is placed at the x-origin (x=3), an interior offset — not the left edge (0).
	const yAxis = page.locator('[data-plot-axis="y"]')
	await expect(yAxis).toBeAttached()
	const transform = (await yAxis.getAttribute('transform')) ?? ''
	const xOffset = Number((transform.match(/translate\(\s*(-?[\d.]+)/) ?? [])[1])
	expect(xOffset).toBeGreaterThan(0)
})

// Radar is polar: it draws its own rings/spokes instead of cartesian axes, and needs its
// own channel props (axis/value/series) rather than x/y — so reaching it through the
// generic type picker is the check that the registry entry is wired, not just present.
test('radar type renders a polar profile with its own grid', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	await page.locator('[data-chart-type="radar"]').click()
	await expect(page.locator('[data-chart-type="radar"]')).toHaveAttribute('data-active', 'true')

	const radar = page.locator('[data-plot-geom="radar"]')
	await expect(radar).toBeAttached()

	// The profiles dataset is two teams over five metrics.
	await expect(radar.locator('[data-plot-element="radar-area"]')).toHaveCount(2)
	await expect(radar.locator('[data-plot-element="radar-axis-label"]')).toHaveCount(5)
	// Its own polar grid, and no cartesian axis lines.
	await expect(radar.locator('[data-plot-element="radar-grid-spoke"]')).toHaveCount(5)
	await expect(page.locator('[data-plot-axis-line]')).toHaveCount(0)
})
