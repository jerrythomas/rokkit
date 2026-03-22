import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('BarChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'bar-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders 4 bars (one per quarter)', async ({ page }) => {
		const bars = page.locator('.preview-area svg rect[data-chart-element="bar"]')
		await expect(bars).toHaveCount(4)
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

	test('bars have solid fill colors by default (colorField=region)', async ({ page }) => {
		const bars = page.locator('.preview-area svg rect[data-chart-element="bar"]')
		const firstFill = await bars.first().getAttribute('fill')
		// Should not be a url() reference when no pattern is active
		expect(firstFill).not.toMatch(/^url\(/)
		expect(firstFill).toBeTruthy()
	})

	test('each bar has a unique fill color when colorField is active', async ({ page }) => {
		const bars = page.locator('.preview-area svg rect[data-chart-element="bar"]')
		const fills = await bars.evaluateAll((els) => els.map((el) => el.getAttribute('fill')))
		const uniqueFills = new Set(fills)
		// 4 bars with 4 regions → 4 distinct colors
		expect(uniqueFills.size).toBe(4)
	})

	test('bars use pattern fill when pattern field is set', async ({ page }) => {
		// Open Properties panel
		await page.locator('[data-toolbar-item][title="Toggle Properties"]').click()
		await page.waitForTimeout(200)

		// Pattern field is the second [data-select] in the controls (Color field is first)
		const selects = page.locator('[data-select]')
		await selects.nth(1).locator('[data-select-trigger]').click()
		await page.locator('[data-select-option]').filter({ hasText: 'region' }).first().click()
		await page.waitForTimeout(400)

		const bars = page.locator('.preview-area svg rect[data-chart-element="bar"]')
		const firstFill = await bars.first().getAttribute('fill')
		expect(firstFill).toMatch(/^url\(#chart-pat-/)
	})

	test('SVG defs contains pattern elements when pattern is active', async ({ page }) => {
		// Open Properties panel and set pattern field
		await page.locator('[data-toolbar-item][title="Toggle Properties"]').click()
		await page.waitForTimeout(200)

		const selects = page.locator('[data-select]')
		await selects.nth(1).locator('[data-select-trigger]').click()
		await page.locator('[data-select-option]').filter({ hasText: 'region' }).first().click()
		await page.waitForTimeout(400)

		const patterns = page.locator('.preview-area svg defs pattern')
		const count = await patterns.count()
		expect(count).toBeGreaterThan(0)
	})

	test('legend hidden by default', async ({ page }) => {
		const legend = page.locator('.preview-area [data-chart-legend]')
		await expect(legend).toHaveCount(0)
	})
})
