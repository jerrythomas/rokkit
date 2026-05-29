import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Grid', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'grid')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders grid container', async ({ page }) => {
		const grid = page.locator('[data-grid]').first()
		await expect(grid).toBeVisible()
		await expect(grid).toHaveAttribute('role', 'grid')
	})

	test('renders all 8 items', async ({ page }) => {
		const items = page.locator('[data-grid] [data-grid-item]')
		await expect(items).toHaveCount(8)
	})

	test('first item is selected by default', async ({ page }) => {
		const first = page.locator('[data-grid-item]').first()
		await expect(first).toHaveAttribute('data-active')
	})

	// ─── Mouse interaction ───────────────────────────────────────────

	test('click selects an item', async ({ page }) => {
		const items = page.locator('[data-grid-item]')
		await items.nth(2).click()

		await expect(items.nth(2)).toHaveAttribute('data-active')
	})

	test('clicking a different item deselects the previous', async ({ page }) => {
		const items = page.locator('[data-grid-item]')
		await items.nth(2).click()

		await expect(items.first()).not.toHaveAttribute('data-active')
		await expect(items.nth(2)).toHaveAttribute('data-active')
	})

	test('selection updates the info field', async ({ page }) => {
		const items = page.locator('[data-grid-item]')
		await items.nth(1).click() // Analytics

		await expect(page.locator('text=analytics')).toBeVisible()
	})

	// ─── Keyboard navigation ─────────────────────────────────────────

	test('ArrowRight moves focus to next item', async ({ page }) => {
		const items = page.locator('[data-grid-item]')
		await items.first().focus()
		await page.keyboard.press('ArrowRight')

		await expect(items.nth(1)).toBeFocused()
	})

	test('ArrowLeft moves focus to previous item', async ({ page }) => {
		const items = page.locator('[data-grid-item]')
		await items.nth(1).focus()
		await page.keyboard.press('ArrowLeft')

		await expect(items.first()).toBeFocused()
	})

	test('Enter selects focused item', async ({ page }) => {
		const items = page.locator('[data-grid-item]')
		await items.nth(3).focus()
		await page.keyboard.press('Enter')

		await expect(items.nth(3)).toHaveAttribute('data-active')
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const grid = page.locator('[data-grid]').first()
					await expect(grid).toHaveScreenshot(`grid-${theme}-${mode}-default.png`)
				})

				test(`${theme}/${mode} - focused state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const items = page.locator('[data-grid-item]')
					await items.nth(2).focus()

					const grid = page.locator('[data-grid]').first()
					await expect(grid).toHaveScreenshot(`grid-${theme}-${mode}-focused.png`)
				})
			}
		}
	})
})
