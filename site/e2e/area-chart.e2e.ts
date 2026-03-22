import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('AreaChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'area-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders path elements (areas)', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-chart-element="area"]')
		await expect(paths.first()).toBeVisible()
	})
})
