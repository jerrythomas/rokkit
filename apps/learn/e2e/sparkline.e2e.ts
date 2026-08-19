import { test, expect } from '@playwright/test'

// /app/sparkline mounts SparklineExplorer. Controls live behind the composer
// "tweak" drawer (same pattern as chart). The baseline rule and trend path are
// 1px axis-aligned SVG shapes → assert toBeAttached()/count(), not toBeVisible().
// All assertions are scoped to [data-sparkline-demo] (the primary sparkline) so
// the fixed KPI example in the same view can't pollute counts.
test('sparkline demo toggles baseline / highlight / trend live', async ({ page }) => {
	await page.goto('/app/sparkline')
	const demo = page.locator('[data-sparkline-demo]')
	await expect(demo).toBeVisible()

	// Open the tweak drawer to reach the controls.
	await page.locator('.composer-tweak-toggle').click()

	// Bars over the mixed-sign series auto-anchor to a zero baseline: the
	// component forces effectiveBaseline=0 for bar+negatives regardless of the
	// prop, so the rule is always present on bar. Assert presence only.
	await page.locator('[data-sparkline-control="type"] button', { hasText: 'bar' }).click()
	await expect(demo.locator('[data-plot-baseline]')).toBeAttached()

	// On a line the baseline is purely prop-driven, so the toggle is observable:
	// on → the rule is attached, off → it is gone.
	await page.locator('[data-sparkline-control="type"] button', { hasText: 'line' }).click()
	const baselineBtn = page.locator('[data-sparkline-control="baseline"] button')
	if ((await baselineBtn.getAttribute('data-active')) !== 'true') await baselineBtn.click()
	await expect(baselineBtn).toHaveAttribute('data-active', 'true')
	await expect(demo.locator('[data-plot-baseline]')).toBeAttached()
	await baselineBtn.click()
	await expect(baselineBtn).not.toHaveAttribute('data-active', 'true')
	await expect(demo.locator('[data-plot-baseline]')).toHaveCount(0)

	// Highlight min/max → highlight circles appear (filled → visible).
	await page.locator('[data-sparkline-control="highlight"] button', { hasText: 'minmax' }).click()
	await expect(demo.locator('[data-plot-highlight]').first()).toBeVisible()

	// Trend linear → trend path appears; trend none → it disappears.
	await page.locator('[data-sparkline-control="trend"] button', { hasText: 'linear' }).click()
	await expect(demo.locator('[data-plot-trend]').first()).toBeAttached()
	await page.locator('[data-sparkline-control="trend"] button', { hasText: 'none' }).click()
	await expect(demo.locator('[data-plot-trend]')).toHaveCount(0)
})

// The Charts guide renders a live sparkline gallery from fenced ```sparkline blocks.
test('charts guide renders the live sparkline gallery', async ({ page }) => {
	await page.goto('/guides/charts')

	const plugins = page.locator('[data-sparkline-plugin]')
	await expect(plugins.first()).toBeVisible()
	expect(await plugins.count()).toBeGreaterThanOrEqual(6)

	// Each fence sets a `title`, so it renders as a labelled card.
	await expect(page.locator('[data-sparkline-caption]').first()).toBeVisible()

	// The gallery covers a zero baseline (negative bars), markers, and a trend line.
	await expect(page.locator('[data-sparkline-plugin] [data-plot-baseline]').first()).toBeAttached()
	await expect(page.locator('[data-sparkline-plugin] [data-plot-highlight]').first()).toBeAttached()
	await expect(page.locator('[data-sparkline-plugin] [data-plot-trend]').first()).toBeAttached()

	// No fence rendered as a parse error.
	await expect(page.locator('[data-block-error]')).toHaveCount(0)
})

// The Charts guide also renders a live chart gallery from fenced ```plot blocks.
test('charts guide renders the live chart gallery', async ({ page }) => {
	await page.goto('/guides/charts')

	const plots = page.locator('[data-plot-plugin]')
	await expect(plots.first()).toBeVisible()
	expect(await plots.count()).toBeGreaterThanOrEqual(8)

	// The gallery covers bar, line, area and scatter (point) geoms — each is a
	// real @rokkit/chart PlotChart rendered from a plot spec.
	await expect(page.locator('[data-plot-plugin] [data-plot-geom="bar"]').first()).toBeAttached()
	await expect(page.locator('[data-plot-plugin] [data-plot-geom="line"]').first()).toBeAttached()
	await expect(page.locator('[data-plot-plugin] [data-plot-geom="area"]').first()).toBeAttached()
	await expect(page.locator('[data-plot-plugin] [data-plot-geom="point"]').first()).toBeAttached()

	// A legend renders for the colour-mapped grouped-bar spec.
	await expect(page.locator('[data-plot-plugin] [data-plot-legend]').first()).toBeAttached()

	// FacetPlot renders small-multiple panels; AnimatedPlot renders a tweened bar geom.
	await expect(page.locator('[data-plot-plugin] [data-facet-panel]').first()).toBeAttached()
})
