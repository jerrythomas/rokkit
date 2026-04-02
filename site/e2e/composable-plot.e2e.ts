import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('Composable Plot', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'composable-plot')
	})

	test('renders the demo container', async ({ page }) => {
		const demo = page.locator('.preview-area [data-composable-plot-demo]')
		await expect(demo).toBeVisible()
	})

	test('renders two chart titles', async ({ page }) => {
		const titles = page.locator('.preview-area [data-chart-title]')
		await expect(titles).toHaveCount(2)
	})

	test('renders SVG elements with data-plot-root', async ({ page }) => {
		const roots = page.locator('.preview-area [data-plot-root]')
		await expect(roots.first()).toBeVisible()
		expect(await roots.count()).toBeGreaterThanOrEqual(2)
	})

	test('renders bar marks', async ({ page }) => {
		const bars = page.locator('.preview-area [data-plot-element="bar"]')
		await expect(bars.first()).toBeVisible()
		expect(await bars.count()).toBeGreaterThan(0)
	})

	test('renders x and y axes', async ({ page }) => {
		const xAxes = page.locator('.preview-area [data-plot-axis="x"]')
		const yAxes = page.locator('.preview-area [data-plot-axis="y"]')
		await expect(xAxes.first()).toBeAttached()
		await expect(yAxes.first()).toBeAttached()
	})

	test('renders axis tick labels', async ({ page }) => {
		const ticks = page.locator('.preview-area [data-plot-tick-label]')
		expect(await ticks.count()).toBeGreaterThan(0)
	})

	test('renders grid lines', async ({ page }) => {
		const grid = page.locator('.preview-area [data-plot-grid]')
		await expect(grid.first()).toBeAttached()
	})

	test('renders line marks', async ({ page }) => {
		const lines = page.locator('.preview-area [data-plot-element="line"]')
		expect(await lines.count()).toBeGreaterThanOrEqual(3)
	})

	test('renders point marks', async ({ page }) => {
		const points = page.locator('.preview-area [data-plot-element="point"]')
		expect(await points.count()).toBeGreaterThan(0)
	})
})
