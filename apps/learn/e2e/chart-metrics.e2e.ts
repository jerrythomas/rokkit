import { test, expect } from '@playwright/test'

// Guards the "last 30 days" showcase on /app/chart: the three new features
// (grid both-axes, trend line, highlighted observation) must render.
//
// The grid lines and the "avg" trend line are axis-aligned (perfectly
// horizontal/vertical stroke-only SVG shapes), so their real bounding box is
// exactly 1 CSS px thick in one dimension. Chromium/Playwright's toBeVisible()
// heuristic treats that degenerate thickness as "not visible" even though the
// element is attached, has a real non-empty bounding box, and is genuinely
// painted (confirmed by comparing against a non-degenerate chart path, which
// toBeVisible() does report as visible). So for those we assert presence via
// toBeAttached() + a positive count instead. The highlight dot is a filled
// circle with real width/height and reliably passes toBeVisible().
test('chart metrics showcase renders grid + trend + highlight', async ({ page }) => {
	await page.goto('/app/chart')

	const gridX = page.locator('[data-plot-grid-line="x"]')
	await expect(gridX.first()).toBeAttached()
	expect(await gridX.count()).toBeGreaterThan(0)

	const gridY = page.locator('[data-plot-grid-line="y"]')
	await expect(gridY.first()).toBeAttached()
	expect(await gridY.count()).toBeGreaterThan(0)

	const trend = page.locator('[data-plot-trend]')
	await expect(trend.first()).toBeAttached()
	expect(await trend.count()).toBeGreaterThan(0)

	await expect(page.locator('[data-plot-highlight]').first()).toBeVisible()
})
