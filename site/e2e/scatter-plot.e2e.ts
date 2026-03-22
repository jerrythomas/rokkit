import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('ScatterPlot', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'scatter-plot')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders circle elements (points)', async ({ page }) => {
		const circles = page.locator('.preview-area svg circle[data-chart-element="point"]')
		await expect(circles.first()).toBeVisible()
	})
})
