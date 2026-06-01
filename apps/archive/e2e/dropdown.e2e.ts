import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes, openDropdownViaKeyboard } from './helpers'
import type { Page } from '@playwright/test'

function openDropdown(page: Page) {
	return openDropdownViaKeyboard(
		page,
		'[data-dropdown-trigger]',
		'[data-dropdown-panel]',
		'[data-dropdown-option]'
	)
}

test.describe('Dropdown', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'dropdown')
	})

	// ─── Keyboard navigation ─────────────────────────────────────────

	test.describe('keyboard navigation', () => {
		test('ArrowDown opens panel and focuses first option', async ({ page }) => {
			const { dropdown, items } = await openDropdown(page)
			await expect(dropdown).toBeVisible()
			await expect(items.first()).toBeFocused()
		})

		test('ArrowDown navigates through options', async ({ page }) => {
			const { items } = await openDropdown(page)
			await expect(items.first()).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(2)).toBeFocused()
		})

		test('ArrowUp navigates back through options', async ({ page }) => {
			const { items } = await openDropdown(page)

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowUp')
			await expect(items.first()).toBeFocused()
		})

		test('Home moves to first option', async ({ page }) => {
			const { items } = await openDropdown(page)

			await page.keyboard.press('End')
			await expect(items.last()).toBeFocused()

			await page.keyboard.press('Home')
			await expect(items.first()).toBeFocused()
		})

		test('End moves to last option', async ({ page }) => {
			const { items } = await openDropdown(page)

			await page.keyboard.press('End')
			await expect(items.last()).toBeFocused()
		})

		test('Enter selects option and closes panel', async ({ page }) => {
			const { dropdown, items } = await openDropdown(page)

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(1)).toBeFocused()
			await page.keyboard.press('Enter')

			await expect(dropdown).not.toBeVisible()
			// Trigger label updates to selected value
			const label = page.locator('[data-dropdown-trigger] [data-dropdown-label]').first()
			await expect(label).toContainText('Banana')
		})

		test('Escape closes panel and returns focus to trigger', async ({ page }) => {
			const { trigger, dropdown } = await openDropdown(page)
			await expect(dropdown).toBeVisible()

			await page.keyboard.press('Escape')
			await expect(dropdown).not.toBeVisible()
			await expect(trigger).toBeFocused()
		})

		test('Enter on trigger opens panel', async ({ page }) => {
			const trigger = page.locator('[data-dropdown-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('Enter')

			const panel = page.locator('[data-dropdown-panel]').first()
			await expect(panel).toBeVisible()
		})

		test('Space on trigger opens panel', async ({ page }) => {
			const trigger = page.locator('[data-dropdown-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('Space')

			const panel = page.locator('[data-dropdown-panel]').first()
			await expect(panel).toBeVisible()
		})
	})

	// ─── Mouse interaction ───────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click on trigger opens panel', async ({ page }) => {
			const trigger = page.locator('[data-dropdown-trigger]').first()
			await trigger.click()

			const panel = page.locator('[data-dropdown-panel]').first()
			await expect(panel).toBeVisible()
		})

		test('click on option updates trigger label', async ({ page }) => {
			const trigger = page.locator('[data-dropdown-trigger]').first()
			await trigger.click()

			const panel = page.locator('[data-dropdown-panel]').first()
			const options = panel.locator('[data-dropdown-option]')
			await options.nth(2).click() // Cherry

			await expect(panel).not.toBeVisible()
			const label = trigger.locator('[data-dropdown-label]')
			await expect(label).toContainText('Cherry')
		})

		test('click on selected option marks it data-active', async ({ page }) => {
			const trigger = page.locator('[data-dropdown-trigger]').first()
			await trigger.click()

			const panel = page.locator('[data-dropdown-panel]').first()
			const options = panel.locator('[data-dropdown-option]')
			await options.nth(1).click() // Banana — close

			await trigger.click() // Reopen
			const activeOption = panel.locator('[data-dropdown-option][data-active]')
			await expect(activeOption).toHaveCount(1)
			await expect(activeOption).toContainText('Banana')
		})

		test('click outside closes panel', async ({ page }) => {
			const trigger = page.locator('[data-dropdown-trigger]').first()
			await trigger.click()

			const panel = page.locator('[data-dropdown-panel]').first()
			await expect(panel).toBeVisible()

			await page.locator('body').click({ position: { x: 10, y: 10 } })
			await expect(panel).not.toBeVisible()
		})

		test('click trigger again closes panel', async ({ page }) => {
			const trigger = page.locator('[data-dropdown-trigger]').first()
			await trigger.click()

			const panel = page.locator('[data-dropdown-panel]').first()
			await expect(panel).toBeVisible()

			await trigger.click()
			await expect(panel).not.toBeVisible()
		})
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - closed state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const dropdown = page.locator('[data-dropdown]').first()
					await expect(dropdown).toHaveScreenshot(`dropdown-${theme}-${mode}-closed.png`)
				})

				test(`${theme}/${mode} - open state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const trigger = page.locator('[data-dropdown-trigger]').first()
					await trigger.click()

					const dropdown = page.locator('[data-dropdown]').first()
					await expect(dropdown).toHaveScreenshot(`dropdown-${theme}-${mode}-open.png`)
				})
			}
		}
	})
})
