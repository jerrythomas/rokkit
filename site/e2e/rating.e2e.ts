import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Rating', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'rating')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders 5 rating items by default', async ({ page }) => {
		const items = page.locator('[data-rating-item]')
		await expect(items).toHaveCount(5)
	})

	test('starts with 3 filled stars', async ({ page }) => {
		const filled = page.locator('[data-rating-item][data-filled]')
		await expect(filled).toHaveCount(3)
	})

	// ─── Mouse interaction ───────────────────────────────────────────

	test('clicking a star sets the rating', async ({ page }) => {
		const items = page.locator('[data-rating-item]')
		await items.nth(4).click() // 5th star

		const filled = page.locator('[data-rating-item][data-filled]')
		await expect(filled).toHaveCount(5)
	})

	test('clicking a lower star reduces the rating', async ({ page }) => {
		const items = page.locator('[data-rating-item]')
		await items.nth(1).click() // 2nd star

		const filled = page.locator('[data-rating-item][data-filled]')
		await expect(filled).toHaveCount(2)
	})

	test('clicking first star sets rating to 1', async ({ page }) => {
		const items = page.locator('[data-rating-item]')
		await items.first().click()

		const filled = page.locator('[data-rating-item][data-filled]')
		await expect(filled).toHaveCount(1)
	})

	// ─── Value display ────────────────────────────────────────────────

	test('value label updates when rating changes', async ({ page }) => {
		const items = page.locator('[data-rating-item]')
		await items.nth(4).click()

		await expect(page.locator('.preview-area')).toContainText('5 / 5')
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const rating = page.locator('[data-rating]')
					await expect(rating).toHaveScreenshot(`rating-${theme}-${mode}-default.png`)
				})

				test(`${theme}/${mode} - full state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					await page.locator('[data-rating-item]').last().click()

					const rating = page.locator('[data-rating]')
					await expect(rating).toHaveScreenshot(`rating-${theme}-${mode}-full.png`)
				})
			}
		}
	})
})
