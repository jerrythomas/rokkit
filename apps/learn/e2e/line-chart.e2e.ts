import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground defaults: see line-chart page — check x/y/color fields

test.describe('LineChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'line-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders line path elements', async ({ page }) => {
		const lines = page.locator('.preview-area svg path[data-plot-element="line"]')
		await expect(lines.first()).toBeVisible()
	})

	test('line path d attribute has no NaN', async ({ page }) => {
		const lines = page.locator('.preview-area svg path[data-plot-element="line"]')
		const dValues = await lines.evaluateAll((els) => els.map((el) => el.getAttribute('d')))
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
