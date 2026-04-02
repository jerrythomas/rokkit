import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('Quadrant-aware Axes', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'quadrant-axes')
	})

	test('renders the demo container', async ({ page }) => {
		const demo = page.locator('.preview-area [data-quadrant-demo]')
		await expect(demo).toBeVisible()
	})

	test('renders two chart titles', async ({ page }) => {
		const titles = page.locator('.preview-area [data-chart-title]')
		await expect(titles).toHaveCount(2)
	})

	test('negative-bar chart renders bar marks', async ({ page }) => {
		const bars = page.locator('.preview-area [data-plot-element="bar"]')
		await expect(bars.first()).toBeVisible()
		expect(await bars.count()).toBeGreaterThan(0)
	})

	test('x-axis is present in negative bar chart', async ({ page }) => {
		const xAxis = page.locator('.preview-area [data-plot-axis="x"]')
		await expect(xAxis.first()).toBeAttached()
	})

	test('y-axis is present in negative bar chart', async ({ page }) => {
		const yAxis = page.locator('.preview-area [data-plot-axis="y"]')
		await expect(yAxis.first()).toBeAttached()
	})

	test('quadrant scatter renders point marks', async ({ page }) => {
		const points = page.locator('.preview-area [data-plot-element="point"]')
		expect(await points.count()).toBeGreaterThan(0)
	})

	test('axes are visible in both charts', async ({ page }) => {
		const axes = page.locator('.preview-area [data-plot-axis]')
		expect(await axes.count()).toBeGreaterThanOrEqual(4)
	})
})
