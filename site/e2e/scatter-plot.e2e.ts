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

	test('renders 10 data points as shape paths', async ({ page }) => {
		// ScatterPlot uses Shape components (SVG paths) not plain circles
		const points = page.locator('.preview-area svg [data-chart-mark="point"] path')
		await expect(points).toHaveCount(10)
	})

	test('renders X and Y axes', async ({ page }) => {
		await expect(page.locator('.preview-area [data-chart-axis="x"]')).toBeVisible()
		await expect(page.locator('.preview-area [data-chart-axis="y"]')).toBeVisible()
	})

	test('renders grid lines by default', async ({ page }) => {
		// SVG <line> elements have zero height, so use count check not toBeVisible
		const count = await page.locator('.preview-area [data-chart-grid-line]').count()
		expect(count).toBeGreaterThan(0)
	})

	test('data points have fill colors when color field is set', async ({ page }) => {
		// Default colorField='channel' — points should have colored fills
		const points = page.locator('.preview-area svg [data-chart-mark="point"] path')
		const firstFill = await points.first().getAttribute('fill')
		expect(firstFill).toBeTruthy()
		expect(firstFill).not.toBe('none')
	})

	test('points render as SVG paths, not circles', async ({ page }) => {
		// Confirm shape rendering — no plain <circle> elements in the points group
		const circles = page.locator('.preview-area svg [data-chart-mark="point"] circle')
		await expect(circles).toHaveCount(0)
	})

	test('legend hidden by default', async ({ page }) => {
		const legend = page.locator('.preview-area [data-chart-legend]')
		await expect(legend).toHaveCount(0)
	})
})
