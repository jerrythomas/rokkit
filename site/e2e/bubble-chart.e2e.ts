import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground defaults: mpg data, x=cty, y=hwy, size=displ, color=class, legend=true

test.describe('BubbleChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'bubble-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		await expect(page.locator('.preview-area svg').first()).toBeVisible()
	})

	test('renders point elements (one per row in mpg)', async ({ page }) => {
		const points = page.locator('.preview-area svg circle[data-plot-element="point"]')
		const count = await points.count()
		// mpg has 234 rows
		expect(count).toBe(234)
	})

	test('points have numeric cx, cy and r attributes (no NaN)', async ({ page }) => {
		const points = page.locator('.preview-area svg circle[data-plot-element="point"]')
		const attrs = await points.evaluateAll((els) =>
			els.slice(0, 10).map((el) => ({
				cx: el.getAttribute('cx'),
				cy: el.getAttribute('cy'),
				r:  el.getAttribute('r')
			}))
		)
		for (const { cx, cy, r } of attrs) {
			expect(isNaN(Number(cx))).toBe(false)
			expect(isNaN(Number(cy))).toBe(false)
			expect(isNaN(Number(r))).toBe(false)
			expect(Number(r)).toBeGreaterThan(0)
		}
	})

	test('bubble radii vary (size field drives radius)', async ({ page }) => {
		const points = page.locator('.preview-area svg circle[data-plot-element="point"]')
		const radii = await points.evaluateAll((els) => els.map((el) => Number(el.getAttribute('r'))))
		const unique = new Set(radii)
		// Different displ values → different radii
		expect(unique.size).toBeGreaterThan(1)
	})

	test('points have fill colors (not the fallback #888)', async ({ page }) => {
		const points = page.locator('.preview-area svg circle[data-plot-element="point"]')
		const firstFill = await points.first().getAttribute('fill')
		expect(firstFill).toBeTruthy()
		expect(firstFill).not.toBe('#888')
	})

	test('renders X and Y axes', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-axis="x"]')).toBeVisible()
		await expect(page.locator('.preview-area [data-plot-axis="y"]')).toBeVisible()
	})

	test('legend is visible by default', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-legend]')).toBeVisible()
	})
})
