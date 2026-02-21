import { test, expect } from '@playwright/test'
import { goToComponent, setTheme, setMode, themes, modes } from './helpers'

test.describe('List', () => {
	test.beforeEach(async ({ page }) => {
		await goToComponent(page, 'list')
	})

	// ─── Keyboard: Flat list (Button items section) ─────────────────

	test.describe('keyboard — flat list', () => {
		test('ArrowDown moves focus through items', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1) // Button items
			const items = list.locator('[data-list-item]')
			await items.first().focus()

			// Press ArrowDown repeatedly and verify focus at each step
			for (let i = 1; i < 3; i++) {
				await page.keyboard.press('ArrowDown')
				await expect(items.nth(i)).toBeFocused()
			}
		})

		test('ArrowUp moves focus back through items', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			// Start at last non-disabled item (Paste, index 2)
			await items.nth(2).focus()

			for (let i = 1; i >= 0; i--) {
				await page.keyboard.press('ArrowUp')
				await expect(items.nth(i)).toBeFocused()
			}
		})

		test('Home moves focus to first item', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			// Start from middle
			await items.nth(1).focus()
			await page.keyboard.press('Home')
			await expect(items.first()).toBeFocused()
		})

		test('End skips disabled item and lands on last enabled', async ({ page }) => {
			// Button items list: Cut, Copy, Paste, Delete(disabled)
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('End')
			// Should land on Paste (index 2), not Delete (index 3, disabled)
			await expect(items.nth(2)).toBeFocused()
		})

		test('ArrowDown at last enabled stays put (disabled after)', async ({ page }) => {
			// Button items list: Cut, Copy, Paste, Delete(disabled)
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('End')

			// Press ArrowDown multiple times — should stay on Paste
			for (let i = 0; i < 3; i++) {
				await page.keyboard.press('ArrowDown')
			}
			await expect(items.nth(2)).toBeFocused()
		})

		test('ArrowUp at first stays on first (no wrap)', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()

			// Press ArrowUp multiple times — should stay on first
			for (let i = 0; i < 3; i++) {
				await page.keyboard.press('ArrowUp')
			}
			await expect(items.first()).toBeFocused()
		})

		test('Enter selects button item', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Enter')

			// Second item (Copy) should now be active
			await expect(items.nth(1)).toHaveAttribute('data-active', 'true')
		})

		test('Space selects button item', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Space')

			// Third item (Paste) should now be active
			await expect(items.nth(2)).toHaveAttribute('data-active', 'true')
		})

		test('focus does not change selection', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			// Click first to select it
			await items.first().click()
			await expect(items.first()).toHaveAttribute('data-active', 'true')

			// Navigate away without selecting
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowDown')

			// First should still be active, third should be focused
			await expect(items.first()).toHaveAttribute('data-active', 'true')
			await expect(items.nth(2)).toBeFocused()
		})
	})

	// ─── Keyboard: Grouped list ──────────────────────────────────────

	test.describe('keyboard — grouped list', () => {
		test('ArrowDown navigates through group labels and children', async ({ page }) => {
			const list = page.locator('[data-list]').nth(2) // Grouped list
			const groupLabels = list.locator('[data-list-group-label]')
			const firstGroupItems = list.locator('[data-list-group]').first().locator('[data-list-item]')

			// Focus first group label
			await groupLabels.first().focus()
			await expect(groupLabels.first()).toBeFocused()

			// ArrowDown → first child of first group
			await page.keyboard.press('ArrowDown')
			await expect(firstGroupItems.first()).toBeFocused()

			// ArrowDown → second child of first group
			await page.keyboard.press('ArrowDown')
			await expect(firstGroupItems.nth(1)).toBeFocused()

			// ArrowDown → second group label
			await page.keyboard.press('ArrowDown')
			await expect(groupLabels.nth(1)).toBeFocused()
		})

		test('ArrowLeft on expanded group collapses it', async ({ page }) => {
			const list = page.locator('[data-list]').nth(2)
			const firstGroup = list.locator('[data-list-group]').first()
			const firstLabel = list.locator('[data-list-group-label]').first()

			await firstLabel.focus()
			// Group starts expanded
			await expect(firstGroup).not.toHaveAttribute('data-list-group-collapsed')

			await page.keyboard.press('ArrowLeft')
			await expect(firstGroup).toHaveAttribute('data-list-group-collapsed')
		})

		test('ArrowRight on collapsed group expands it', async ({ page }) => {
			const list = page.locator('[data-list]').nth(2)
			const firstGroup = list.locator('[data-list-group]').first()
			const firstLabel = list.locator('[data-list-group-label]').first()

			// Collapse first
			await firstLabel.focus()
			await page.keyboard.press('ArrowLeft')
			await expect(firstGroup).toHaveAttribute('data-list-group-collapsed')

			// Expand
			await page.keyboard.press('ArrowRight')
			await expect(firstGroup).not.toHaveAttribute('data-list-group-collapsed')
		})

		test('Enter on group label toggles expansion', async ({ page }) => {
			const list = page.locator('[data-list]').nth(2)
			const firstGroup = list.locator('[data-list-group]').first()
			const firstLabel = list.locator('[data-list-group-label]').first()

			await firstLabel.focus()
			await expect(firstGroup).not.toHaveAttribute('data-list-group-collapsed')

			// Enter collapses
			await page.keyboard.press('Enter')
			await expect(firstGroup).toHaveAttribute('data-list-group-collapsed')

			// Enter expands
			await page.keyboard.press('Enter')
			await expect(firstGroup).not.toHaveAttribute('data-list-group-collapsed')
		})

		test('repeated collapse/expand cycles work correctly', async ({ page }) => {
			const list = page.locator('[data-list]').nth(2)
			const firstGroup = list.locator('[data-list-group]').first()
			const firstLabel = list.locator('[data-list-group-label]').first()

			await firstLabel.focus()

			// Collapse and expand 3 times via ArrowLeft/ArrowRight
			for (let i = 0; i < 3; i++) {
				await page.keyboard.press('ArrowLeft')
				await expect(firstGroup).toHaveAttribute('data-list-group-collapsed')
				await page.keyboard.press('ArrowRight')
				await expect(firstGroup).not.toHaveAttribute('data-list-group-collapsed')
			}
		})
	})

	// ─── Mouse interaction ───────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click selects button item', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')

			await items.nth(1).click()
			await expect(items.nth(1)).toHaveAttribute('data-active', 'true')
		})

		test('click deselects previous item', async ({ page }) => {
			const list = page.locator('[data-list]').nth(1)
			const items = list.locator('[data-list-item]')

			await items.first().click()
			await expect(items.first()).toHaveAttribute('data-active', 'true')

			await items.nth(1).click()
			await expect(items.first()).not.toHaveAttribute('data-active')
			await expect(items.nth(1)).toHaveAttribute('data-active', 'true')
		})

		test('click on group label toggles expansion', async ({ page }) => {
			const list = page.locator('[data-list]').nth(2)
			const firstGroup = list.locator('[data-list-group]').first()
			const firstLabel = list.locator('[data-list-group-label]').first()

			await expect(firstGroup).not.toHaveAttribute('data-list-group-collapsed')

			await firstLabel.click()
			await expect(firstGroup).toHaveAttribute('data-list-group-collapsed')

			await firstLabel.click()
			await expect(firstGroup).not.toHaveAttribute('data-list-group-collapsed')
		})
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const list = page.locator('[data-list]').nth(1) // Button items
					await expect(list).toHaveScreenshot(`list-${theme}-${mode}-default.png`)
				})

				test(`${theme}/${mode} - focused state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const list = page.locator('[data-list]').nth(1)
					const items = list.locator('[data-list-item]')
					await items.first().focus()
					await page.keyboard.press('ArrowDown')

					await expect(list).toHaveScreenshot(`list-${theme}-${mode}-focused.png`)
				})
			}
		}
	})
})
