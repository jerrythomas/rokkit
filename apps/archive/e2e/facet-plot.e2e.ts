import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Default: facet by drv (3 values: 4, f, r), x=class, y=hwy, stat=mean
// Produces 3 panels each with up to 7 class bars

test.describe('FacetPlot playground', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'facet-plot')
	})

	test('renders the facet grid container', async ({ page }) => {
		await expect(page.locator('[data-facet-grid]')).toBeVisible()
	})

	test('renders 3 panels when faceting by drv (default)', async ({ page }) => {
		const panels = page.locator('[data-facet-panel]')
		await expect(panels).toHaveCount(3)
	})

	test('each panel has a title showing the facet value', async ({ page }) => {
		const titles = page.locator('[data-facet-title]')
		await expect(titles).toHaveCount(3)

		const texts = await titles.allTextContents()
		// drv values are 4, f, r
		expect(texts).toContain('4')
		expect(texts).toContain('f')
		expect(texts).toContain('r')
	})

	test('each panel renders an SVG with bar elements', async ({ page }) => {
		const panels = page.locator('[data-facet-panel]')
		for (let i = 0; i < 3; i++) {
			const svg = panels.nth(i).locator('svg')
			await expect(svg).toBeVisible()
			const bars = panels.nth(i).locator('[data-plot-element="bar"]')
			await expect(bars.first()).toBeVisible()
		}
	})

	test('bars have no NaN in their geometry', async ({ page }) => {
		const bars = page.locator('[data-plot-element="bar"]')
		const count = await bars.count()
		expect(count).toBeGreaterThan(0)

		const xValues = await bars.evaluateAll((els) => els.map((el) => el.getAttribute('x')))
		for (const x of xValues) {
			expect(x).not.toContain('NaN')
		}
	})

	test('axes are rendered in each panel', async ({ page }) => {
		const xAxes = page.locator('[data-facet-panel] [data-plot-axis="x"]')
		await expect(xAxes.first()).toBeVisible()
		const count = await xAxes.count()
		expect(count).toBe(3)
	})
})
