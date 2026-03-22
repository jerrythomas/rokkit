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

	test('renders path elements (lines)', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-chart-element="line"]')
		await expect(paths.first()).toBeVisible()
	})
})
