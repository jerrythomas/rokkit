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

	test('renders rect elements (bars)', async ({ page }) => {
		const bars = page.locator('.preview-area svg rect[data-chart-element="bar"]')
		await expect(bars.first()).toBeVisible()
	})
})
