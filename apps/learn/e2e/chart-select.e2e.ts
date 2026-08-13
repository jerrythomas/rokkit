import { test, expect } from '@playwright/test'

// Guards the metrics showcase click-to-select: clicking a line vertex selects it
// (a data-plot-selected mark appears) and the drill caption updates.
//
// Scoped to the "Metrics" section and targets a mid-series point (index 15 of 30
// daily observations). The first point (index 0) sits exactly on the x-axis line,
// and the last point (index 29, "today") sits under the pre-highlighted
// [data-plot-highlight] dot — both genuinely intercept pointer events in Chromium's
// hit-testing, so a real (non-forced) click on either lands on the overlapping
// element instead of the line-hover circle. A mid-series point has no such overlap
// and receives a real click, which is what proves click-to-select actually works.
test('clicking a metrics point selects it and drills', async ({ page }) => {
	await page.goto('/app/chart')
	const metricsSection = page.locator('section', { has: page.locator('header', { hasText: 'Metrics' }) })
	const hit = metricsSection.locator('[data-plot-element="line-hover"]').nth(15)
	await expect(hit).toBeAttached()
	await hit.click()
	await expect(page.locator('[data-plot-highlight][data-plot-selected="true"]').first()).toBeAttached()
	await expect(page.getByText(/^Selected:/).first()).toBeVisible()
})

// The first observation sits on the x-axis line and the last ("today") sits under
// the pre-highlighted dot. `pointer-events: none` on the axis line + highlight marks
// lets real clicks pass through to the line-hover hit targets, so BOTH edge points
// are now selectable (and selection accumulates — multi-select).
test('edge observations (axis-/highlight-overlapped) are clickable after pointer-events fix', async ({ page }) => {
	await page.goto('/app/chart')
	const metricsSection = page.locator('section', { has: page.locator('header', { hasText: 'Metrics' }) })
	const hits = metricsSection.locator('[data-plot-element="line-hover"]')
	await hits.first().click() // index 0 — was blocked by the x-axis line
	await expect(page.locator('[data-plot-highlight][data-plot-selected="true"]')).toHaveCount(1)
	await hits.last().click() // "today" — was blocked by the highlight dot
	await expect(page.locator('[data-plot-highlight][data-plot-selected="true"]')).toHaveCount(2)
})
