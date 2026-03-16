import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes, openDropdownViaKeyboard } from './helpers'

function openMultiSelect(page: Page) {
	return openDropdownViaKeyboard(
		page,
		'[data-multiselect] [data-select-trigger]',
		'[data-multiselect] [data-select-dropdown]',
		'[data-select-option]',
	)
}

test.describe('MultiSelect', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'multi-select')
	})

	// ─── Keyboard navigation ────────────────────────────────────────

	test.describe('keyboard navigation', () => {
		test('ArrowDown opens dropdown and focuses first item', async ({ page }) => {
			const { dropdown, items: options } = await openMultiSelect(page)
			await expect(dropdown).toBeVisible()
			await expect(options.first()).toBeFocused()
		})

		test('ArrowDown navigates through options', async ({ page }) => {
			const { items: options } = await openMultiSelect(page)
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(options.nth(2)).toBeFocused()
		})

		test('Enter toggles selection without closing', async ({ page }) => {
			const { dropdown, items: options } = await openMultiSelect(page)
			await expect(options.first()).toBeFocused()

			// Select first item
			await page.keyboard.press('Enter')
			await expect(dropdown).toBeVisible() // stays open
			await expect(options.first()).toHaveAttribute('data-selected', 'true')

			// Navigate down and select second
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()
			await page.keyboard.press('Enter')
			await expect(dropdown).toBeVisible()
			await expect(options.nth(1)).toHaveAttribute('data-selected', 'true')

			// Both should be selected
			const selected = dropdown.locator('[data-select-option][data-selected]')
			await expect(selected).toHaveCount(2)
		})

		test('Enter deselects already-selected item', async ({ page }) => {
			const { items: options } = await openMultiSelect(page)
			await expect(options.first()).toBeFocused()

			// Select then deselect
			await page.keyboard.press('Enter')
			await expect(options.first()).toHaveAttribute('data-selected', 'true')

			await page.keyboard.press('Enter')
			await expect(options.first()).not.toHaveAttribute('data-selected')
		})

		test('Escape closes dropdown', async ({ page }) => {
			const { dropdown } = await openMultiSelect(page)
			await expect(dropdown).toBeVisible()

			await page.keyboard.press('Escape')
			await expect(dropdown).not.toBeVisible()
		})
	})

	// ─── Mouse interaction ──────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click on trigger opens dropdown', async ({ page }) => {
			const trigger = page.locator('[data-multiselect] [data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-multiselect] [data-select-dropdown]').first()
			await expect(dropdown).toBeVisible()
		})

		test('click on option toggles selection without closing', async ({ page }) => {
			const trigger = page.locator('[data-multiselect] [data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-multiselect] [data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')

			await options.first().click()
			await expect(dropdown).toBeVisible()
			await expect(options.first()).toHaveAttribute('data-selected', 'true')

			// Click second option
			await options.nth(1).click()
			await expect(options.nth(1)).toHaveAttribute('data-selected', 'true')

			// Both selected
			const selected = dropdown.locator('[data-select-option][data-selected]')
			await expect(selected).toHaveCount(2)
		})

		test('click outside closes dropdown', async ({ page }) => {
			const trigger = page.locator('[data-multiselect] [data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-multiselect] [data-select-dropdown]').first()
			await expect(dropdown).toBeVisible()

			await page.locator('body').click({ position: { x: 10, y: 10 } })
			await expect(dropdown).not.toBeVisible()
		})

		test('tags appear for selected items', async ({ page }) => {
			const trigger = page.locator('[data-multiselect] [data-select-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-multiselect] [data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')

			await options.first().click()
			await options.nth(1).click()

			const tags = page.locator('[data-multiselect] [data-select-tag]')
			await expect(tags).toHaveCount(2)
		})
	})

	// ─── Visual snapshots ───────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - closed state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const select = page.locator('[data-multiselect]').first()
					await expect(select).toHaveScreenshot(`multi-select-${theme}-${mode}-closed.png`)
				})

				test(`${theme}/${mode} - open state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const trigger = page.locator('[data-multiselect] [data-select-trigger]').first()
					await trigger.click()

					const select = page.locator('[data-multiselect]').first()
					await expect(select).toHaveScreenshot(`multi-select-${theme}-${mode}-open.png`)
				})
			}
		}
	})
})
