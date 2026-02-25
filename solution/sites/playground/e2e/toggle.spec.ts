import { test, expect } from '@playwright/test'
import { goToComponent, setTheme, setMode, themes, modes } from './helpers'

test.describe('Toggle', () => {
	test.beforeEach(async ({ page }) => {
		await goToComponent(page, 'toggle')
	})

	test.describe('keyboard navigation', () => {
		test('ArrowRight moves focus to next option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await first.focus()
			await page.keyboard.press('ArrowRight')

			const second = toggle.locator('[data-toggle-option]').nth(1)
			await expect(second).toBeFocused()
		})

		test('ArrowLeft moves focus to previous option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await first.focus()
			// Move right then left to get back
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('ArrowLeft')

			await expect(first).toBeFocused()
		})

		test('Home moves focus to first option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await first.focus()
			// Move away from first
			await page.keyboard.press('End')
			// Then Home back
			await page.keyboard.press('Home')

			await expect(first).toBeFocused()
		})

		test('End moves focus to last option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await first.focus()
			await page.keyboard.press('End')

			const last = toggle.locator('[data-toggle-option]').last()
			await expect(last).toBeFocused()
		})

		test('ArrowRight at last stays on last', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			const last = toggle.locator('[data-toggle-option]').last()
			await first.focus()
			await page.keyboard.press('End')
			await page.keyboard.press('ArrowRight')

			await expect(last).toBeFocused()
		})

		test('ArrowLeft at first stays on first', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await first.focus()
			await page.keyboard.press('ArrowLeft')

			await expect(first).toBeFocused()
		})

		test('focus does not change selection', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await expect(first).toHaveAttribute('data-selected', 'true')

			await first.focus()
			await page.keyboard.press('ArrowRight')

			// First option should still be selected
			await expect(first).toHaveAttribute('data-selected', 'true')
			// Second option should be focused but NOT selected
			const second = toggle.locator('[data-toggle-option]').nth(1)
			await expect(second).toBeFocused()
			await expect(second).not.toHaveAttribute('data-selected', 'true')
		})

		test('Enter selects the focused option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await first.focus()
			await page.keyboard.press('ArrowRight')

			const second = toggle.locator('[data-toggle-option]').nth(1)
			await page.keyboard.press('Enter')
			await expect(second).toHaveAttribute('data-selected', 'true')
		})

		test('Space selects the focused option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			await first.focus()
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('ArrowRight')

			const third = toggle.locator('[data-toggle-option]').nth(2)
			await page.keyboard.press('Space')
			await expect(third).toHaveAttribute('data-selected', 'true')
		})
	})

	test.describe('mouse interaction', () => {
		test('click selects option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const second = toggle.locator('[data-toggle-option]').nth(1)
			await second.click()
			await expect(second).toHaveAttribute('data-selected', 'true')
		})

		test('click deselects previous option', async ({ page }) => {
			const toggle = page.locator('[data-toggle]').first()
			const first = toggle.locator('[data-toggle-option]').first()
			const second = toggle.locator('[data-toggle-option]').nth(1)

			await expect(first).toHaveAttribute('data-selected', 'true')
			await second.click()
			await expect(first).not.toHaveAttribute('data-selected', 'true')
			await expect(second).toHaveAttribute('data-selected', 'true')
		})
	})

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const toggle = page.locator('[data-toggle]').first()
					await expect(toggle).toHaveScreenshot(`toggle-${theme}-${mode}-default.png`)
				})

				test(`${theme}/${mode} - focused state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const toggle = page.locator('[data-toggle]').first()
					// Focus first then arrow to second (non-selected) to show focus style
					const first = toggle.locator('[data-toggle-option]').first()
					await first.focus()
					await page.keyboard.press('ArrowRight')

					await expect(toggle).toHaveScreenshot(`toggle-${theme}-${mode}-focused.png`)
				})
			}
		}
	})
})
