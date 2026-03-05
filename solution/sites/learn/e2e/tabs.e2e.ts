import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Tabs — play page', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'tabs')
	})

	// ─── Keyboard navigation ────────────────────────────────────────

	test.describe('keyboard navigation', () => {
		test('ArrowRight moves focus to next tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			await triggers.first().focus()
			await page.keyboard.press('ArrowRight')

			await expect(triggers.nth(1)).toBeFocused()
		})

		test('ArrowLeft moves focus to previous tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			await triggers.first().focus()
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('ArrowLeft')

			await expect(triggers.first()).toBeFocused()
		})

		test('Home moves focus to first tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			await triggers.first().focus()
			await page.keyboard.press('End')
			await page.keyboard.press('Home')

			await expect(triggers.first()).toBeFocused()
		})

		test('End moves focus to last tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			await triggers.first().focus()
			await page.keyboard.press('End')

			await expect(triggers.last()).toBeFocused()
		})

		test('focus does not change selection', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			// First tab is selected (value='overview')
			await expect(triggers.first()).toHaveAttribute('data-selected', 'true')

			await triggers.first().focus()
			await page.keyboard.press('ArrowRight')

			// First should still be selected
			await expect(triggers.first()).toHaveAttribute('data-selected', 'true')
			// Second should be focused but not selected
			await expect(triggers.nth(1)).toBeFocused()
			await expect(triggers.nth(1)).not.toHaveAttribute('data-selected', 'true')
		})

		test('Enter selects the focused tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			await triggers.first().focus()
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('Enter')

			await expect(triggers.nth(1)).toHaveAttribute('data-selected', 'true')
		})

		test('Space selects the focused tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			await triggers.first().focus()
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('Space')

			await expect(triggers.nth(2)).toHaveAttribute('data-selected', 'true')
		})

		test('selecting tab shows corresponding panel', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			const panels = tabs.locator('[data-tabs-panel]')

			await triggers.first().focus()
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('Enter')

			await expect(panels.nth(1)).toHaveAttribute('data-panel-active', 'true')
			await expect(panels.first()).not.toHaveAttribute('data-panel-active')
		})
	})

	// ─── Mouse interaction ──────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click selects tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			await triggers.nth(1).click()

			await expect(triggers.nth(1)).toHaveAttribute('data-selected', 'true')
		})

		test('click deselects previous tab', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')

			await expect(triggers.first()).toHaveAttribute('data-selected', 'true')
			await triggers.nth(1).click()
			await expect(triggers.first()).not.toHaveAttribute('data-selected', 'true')
			await expect(triggers.nth(1)).toHaveAttribute('data-selected', 'true')
		})

		test('click shows corresponding panel', async ({ page }) => {
			const tabs = page.locator('[data-tabs]').first()
			const triggers = tabs.locator('[data-tabs-trigger]')
			const panels = tabs.locator('[data-tabs-panel]')

			await triggers.nth(2).click()

			await expect(panels.nth(2)).toHaveAttribute('data-panel-active', 'true')
			await expect(panels.first()).not.toHaveAttribute('data-panel-active')
			await expect(panels.nth(1)).not.toHaveAttribute('data-panel-active')
		})
	})

	// ─── Visual snapshots ───────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const tabs = page.locator('[data-tabs]').first()
					await expect(tabs).toHaveScreenshot(`tabs-${theme}-${mode}-default.png`)
				})

				test(`${theme}/${mode} - focused state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const tabs = page.locator('[data-tabs]').first()
					const triggers = tabs.locator('[data-tabs-trigger]')
					await triggers.first().focus()
					await page.keyboard.press('ArrowRight')

					await expect(tabs).toHaveScreenshot(`tabs-${theme}-${mode}-focused.png`)
				})
			}
		}
	})
})
