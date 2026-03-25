import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground: see area-chart page for default data and options

test.describe('AreaChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'area-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders area path elements', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-plot-element="area"]')
		await expect(paths.first()).toBeVisible()
	})

	test('area path d attribute has no NaN', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-plot-element="area"]')
		const dValues = await paths.evaluateAll((els) => els.map((el) => el.getAttribute('d')))
		for (const d of dValues) {
			expect(d).toBeTruthy()
			expect(d).not.toContain('NaN')
		}
	})

	test('renders X and Y axes', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-axis="x"]')).toBeVisible()
		await expect(page.locator('.preview-area [data-plot-axis="y"]')).toBeVisible()
	})

	test('renders grid lines by default', async ({ page }) => {
		const count = await page.locator('.preview-area [data-plot-grid-line]').count()
		expect(count).toBeGreaterThan(0)
	})
})
