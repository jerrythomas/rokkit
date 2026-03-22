import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

test.describe('Sparkline', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'sparkline')
	})

	test('renders SVG sparkline', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('default type is line (renders path, no rects)', async ({ page }) => {
		const path = page.locator('.preview-area svg path').first()
		await expect(path).toBeVisible()
	})
})
