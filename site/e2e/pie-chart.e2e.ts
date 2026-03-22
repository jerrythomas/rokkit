import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('PieChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'pie-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders path elements (arcs)', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-chart-element="arc"]')
		await expect(paths.first()).toBeVisible()
	})
})
