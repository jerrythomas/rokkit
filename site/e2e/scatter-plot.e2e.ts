import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground defaults: mpg data, x=displ, y=hwy, color=class (7 classes), legend=true

test.describe('ScatterPlot', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'scatter-plot')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders point elements (one per row in mpg)', async ({ page }) => {
		const points = page.locator('.preview-area svg circle[data-plot-element="point"]')
		const count = await points.count()
		// mpg has 234 rows
		expect(count).toBe(234)
	})

	test('points have numeric cx and cy (no NaN)', async ({ page }) => {
		const points = page.locator('.preview-area svg circle[data-plot-element="point"]')
		const attrs = await points.evaluateAll((els) =>
			els.slice(0, 10).map((el) => ({
				cx: el.getAttribute('cx'),
				cy: el.getAttribute('cy')
			}))
		)
		for (const { cx, cy } of attrs) {
			expect(isNaN(Number(cx))).toBe(false)
			expect(isNaN(Number(cy))).toBe(false)
		}
	})

	test('points have fill colors when color field is set', async ({ page }) => {
		const points = page.locator('.preview-area svg circle[data-plot-element="point"]')
		const firstFill = await points.first().getAttribute('fill')
		expect(firstFill).toBeTruthy()
		expect(firstFill).not.toBe('#888')
	})

	test('renders X and Y axes', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-axis="x"]')).toBeVisible()
		await expect(page.locator('.preview-area [data-plot-axis="y"]')).toBeVisible()
	})

	test('renders grid lines by default', async ({ page }) => {
		const count = await page.locator('.preview-area [data-plot-grid-line]').count()
		expect(count).toBeGreaterThan(0)
	})

	test('legend is visible when color field is set (default)', async ({ page }) => {
		const legend = page.locator('.preview-area [data-plot-legend]')
		await expect(legend).toBeVisible()
	})
})
