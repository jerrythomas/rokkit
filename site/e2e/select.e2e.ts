import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes, openDropdownViaKeyboard } from './helpers'

function openSelect(page: Page) {
	return openDropdownViaKeyboard(page, '[data-select-trigger]', '[data-select-dropdown]', '[data-select-option]')
}

test.describe('Select — play page', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'select')
	})

	// ─── Keyboard navigation ────────────────────────────────────────

	test.describe('keyboard navigation', () => {
		test('ArrowDown opens dropdown and focuses first item', async ({ page }) => {
			const { dropdown, items: options } = await openSelect(page)
			await expect(dropdown).toBeVisible()
			await expect(options.first()).toBeFocused()
		})

		test('ArrowDown navigates through options', async ({ page }) => {
			const { items: options } = await openSelect(page)
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(options.nth(2)).toBeFocused()
		})

		test('ArrowUp navigates back through options', async ({ page }) => {
			const { items: options } = await openSelect(page)
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(2)).toBeFocused()
			await page.keyboard.press('ArrowUp')
			await expect(options.nth(1)).toBeFocused()
		})

		test('Home and End navigate to first/last option', async ({ page }) => {
			const { items: options } = await openSelect(page)
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('End')
			await expect(options.last()).toBeFocused()

			await page.keyboard.press('Home')
			await expect(options.first()).toBeFocused()
		})

		test('Enter selects option and closes dropdown', async ({ page }) => {
			const { dropdown, items: options } = await openSelect(page)
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('ArrowDown') // Banana
			await expect(options.nth(1)).toBeFocused()
			await page.keyboard.press('Enter')

			await expect(dropdown).not.toBeVisible()
			const valueText = page.locator('[data-select-value]').first()
			await expect(valueText).toContainText('Banana')
		})

		test('Escape closes dropdown and returns focus to trigger', async ({ page }) => {
			const { trigger, dropdown } = await openSelect(page)
			await expect(dropdown).toBeVisible()

			await page.keyboard.press('Escape')
			await expect(dropdown).not.toBeVisible()
			await expect(trigger).toBeFocused()
		})

		test('reopening focuses previously selected item', async ({ page }) => {
			const { dropdown, items: options } = await openSelect(page)
			await expect(options.first()).toBeFocused()

			// Select Cherry (index 2)
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(2)).toBeFocused()
			await page.keyboard.press('Enter')
			await expect(dropdown).not.toBeVisible()

			// Reopen — Cherry should be focused
			await page.keyboard.press('ArrowDown')
			await expect(dropdown).toBeVisible()
			await expect(options.nth(2)).toBeFocused()
		})
	})

	// ─── Mouse interaction ──────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click on trigger opens dropdown', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-select-dropdown]').first()
			await expect(dropdown).toBeVisible()
		})

		test('click on option selects and closes', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')
			await options.nth(2).click() // Cherry

			await expect(dropdown).not.toBeVisible()
			const valueText = page.locator('[data-select-value]').first()
			await expect(valueText).toContainText('Cherry')
		})

		test('click outside closes dropdown', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-select-dropdown]').first()
			await expect(dropdown).toBeVisible()

			await page.locator('body').click({ position: { x: 10, y: 10 } })
			await expect(dropdown).not.toBeVisible()
		})

		test('selected option shows check mark', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')
			await options.nth(1).click() // Banana

			await trigger.click()
			const selected = dropdown.locator('[data-select-option][data-selected]')
			await expect(selected).toHaveCount(1)
			await expect(selected).toContainText('Banana')
		})
	})

	// ─── Visual snapshots ───────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - closed state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const select = page.locator('[data-select]').first()
					await expect(select).toHaveScreenshot(`select-${theme}-${mode}-closed.png`)
				})

				test(`${theme}/${mode} - open state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const trigger = page.locator('[data-select-trigger]').first()
					await trigger.click()

					const select = page.locator('[data-select]').first()
					await expect(select).toHaveScreenshot(`select-${theme}-${mode}-open.png`)
				})
			}
		}
	})
})
