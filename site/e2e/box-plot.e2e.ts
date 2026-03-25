import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground defaults: mpg data, x=class (7 categories), y=hwy, fill=drv (3 values), legend=true
// fill=drv groups boxes → 12 unique (class, drv) combos in mpg

test.describe('BoxPlot', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'box-plot')
	})

	test('renders an SVG element', async ({ page }) => {
		await expect(page.locator('.preview-area svg').first()).toBeVisible()
	})

	test('renders grouped box body rects (fill=drv groups within each class)', async ({ page }) => {
		const boxes = page.locator('.preview-area svg rect[data-plot-element="box-body"]')
		const count = await boxes.count()
		// 12 unique (class, drv) combos with fill=drv default
		expect(count).toBe(12)
	})

	test('box body rects have non-NaN height and y', async ({ page }) => {
		const boxes = page.locator('.preview-area svg rect[data-plot-element="box-body"]')
		const attrs = await boxes.evaluateAll((els) =>
			els.map((el) => ({
				y: Number(el.getAttribute('y')),
				h: Number(el.getAttribute('height'))
			}))
		)
		for (const { y, h } of attrs) {
			expect(isNaN(y)).toBe(false)
			expect(isNaN(h)).toBe(false)
			expect(h).toBeGreaterThanOrEqual(0)
		}
	})

	test('box bodies have fill color (not the fallback #888)', async ({ page }) => {
		const boxes = page.locator('.preview-area svg rect[data-plot-element="box-body"]')
		const firstFill = await boxes.first().getAttribute('fill')
		expect(firstFill).toBeTruthy()
		expect(firstFill).not.toBe('#888')
	})

	test('renders median line elements (one per grouped box)', async ({ page }) => {
		const medians = page.locator('.preview-area svg line[data-plot-element="box-median"]')
		expect(await medians.count()).toBe(12)
	})

	test('renders whisker line elements (two per grouped box)', async ({ page }) => {
		const whiskers = page.locator('.preview-area svg line[data-plot-element="box-whisker"]')
		expect(await whiskers.count()).toBe(24)
	})

	test('box bodies fit within the SVG plot area (y ≥ 0)', async ({ page }) => {
		const boxes = page.locator('.preview-area svg rect[data-plot-element="box-body"]')
		const svgHeight = Number(
			await page.locator('.preview-area svg').first().getAttribute('height')
		)
		const attrs = await boxes.evaluateAll((els) =>
			els.map((el) => ({
				y: Number(el.getAttribute('y')),
				h: Number(el.getAttribute('height'))
			}))
		)
		for (const { y, h } of attrs) {
			expect(y).toBeGreaterThanOrEqual(0)
			expect(y + h).toBeLessThanOrEqual(svgHeight + 1)
		}
	})

	test('renders X and Y axes', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-axis="x"]')).toBeVisible()
		await expect(page.locator('.preview-area [data-plot-axis="y"]')).toBeVisible()
	})

	test('legend is visible by default', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-legend]')).toBeVisible()
	})
})
