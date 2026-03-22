import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('LineChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'line-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders a single line by default (no color field)', async ({ page }) => {
		const lines = page.locator('.preview-area svg path[data-chart-element="line"]')
		await expect(lines).toHaveCount(1)
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

	test('no symbol markers rendered by default', async ({ page }) => {
		const symbols = page.locator('.preview-area [data-chart-mark="symbol"]')
		await expect(symbols).toHaveCount(0)
	})

	test('renders tick labels on both axes', async ({ page }) => {
		const tickLabels = page.locator('.preview-area [data-chart-tick-label]')
		const count = await tickLabels.count()
		expect(count).toBeGreaterThan(2)
	})

	test('legend hidden by default', async ({ page }) => {
		const legend = page.locator('.preview-area [data-chart-legend]')
		await expect(legend).toHaveCount(0)
	})

	test('renders 3 lines when color field is set to region', async ({ page }) => {
		// Open Properties panel
		await page.locator('[data-toolbar-item][title="Toggle Properties"]').click()
		await page.waitForTimeout(200)

		// Color field is the first [data-select] in the controls
		const selects = page.locator('[data-select]')
		await selects.first().locator('[data-select-trigger]').click()
		await page.locator('[data-select-option]').filter({ hasText: 'region' }).first().click()
		await page.waitForTimeout(300)

		const lines = page.locator('.preview-area svg path[data-chart-element="line"]')
		await expect(lines).toHaveCount(3)
	})

	test('symbol markers appear per series when color+symbol are set', async ({ page }) => {
		// Open Properties panel
		await page.locator('[data-toolbar-item][title="Toggle Properties"]').click()
		await page.waitForTimeout(200)

		// Set Color field to 'region'
		const selects = page.locator('[data-select]')
		await selects.first().locator('[data-select-trigger]').click()
		await page.locator('[data-select-option]').filter({ hasText: 'region' }).first().click()
		await page.waitForTimeout(200)

		// Toggle Symbols on — checkboxes use hidden inputs with visible [data-checkbox-icon] spans
		// Symbol is the first [data-checkbox-root] in the controls (symbol, grid, legend order)
		const symbolCheckbox = page.locator('[data-checkbox-root]').first().locator('[data-checkbox-icon]')
		await symbolCheckbox.click()
		await page.waitForTimeout(300)

		const symbolGroup = page.locator('.preview-area [data-chart-mark="symbol"]')
		await expect(symbolGroup).toHaveCount(1)
		// 3 series × 6 data points = 18 symbol paths
		const symbolPaths = symbolGroup.locator('path')
		await expect(symbolPaths).toHaveCount(18)
	})
})
