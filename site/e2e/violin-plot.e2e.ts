import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground defaults: mpg data, x=class (7 categories), y=hwy, fill=drv (3 values), legend=true
// fill=drv groups violins → 12 unique (class, drv) combos in mpg

test.describe('ViolinPlot', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'violin-plot')
	})

	test('renders an SVG element', async ({ page }) => {
		await expect(page.locator('.preview-area svg').first()).toBeVisible()
	})

	test('renders grouped violin path elements (fill=drv groups within each class)', async ({ page }) => {
		const violins = page.locator('.preview-area svg path[data-plot-element="violin"]')
		const count = await violins.count()
		// 12 unique (class, drv) combos with fill=drv default
		expect(count).toBe(12)
	})

	test('violin path d attributes have no NaN', async ({ page }) => {
		const violins = page.locator('.preview-area svg path[data-plot-element="violin"]')
		const dValues = await violins.evaluateAll((els) => els.map((el) => el.getAttribute('d')))
		for (const d of dValues) {
			expect(d).toBeTruthy()
			expect(d).not.toContain('NaN')
		}
	})

	test('violin path d attributes are non-trivial (have M and curve commands)', async ({ page }) => {
		const violins = page.locator('.preview-area svg path[data-plot-element="violin"]')
		const dValues = await violins.evaluateAll((els) => els.map((el) => el.getAttribute('d')))
		for (const d of dValues) {
			expect(d).toMatch(/M/)
			expect(d!.length).toBeGreaterThan(10)
		}
	})

	test('violin paths have fill color (not the fallback #888)', async ({ page }) => {
		const violins = page.locator('.preview-area svg path[data-plot-element="violin"]')
		const firstFill = await violins.first().getAttribute('fill')
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

	test('legend is visible by default', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-legend]')).toBeVisible()
	})
})
