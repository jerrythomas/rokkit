import { test, expect } from '@playwright/test'
import { goToComponent, setTheme, setMode, themes, modes } from './helpers'

test.describe('Select', () => {
	test.beforeEach(async ({ page }) => {
		await goToComponent(page, 'select')
	})

	// ─── Keyboard navigation ────────────────────────────────────────

	test.describe('keyboard navigation', () => {
		test('ArrowDown opens dropdown and focuses first item', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-select-dropdown]').first()
			await expect(dropdown).toBeVisible()
			const options = dropdown.locator('[data-select-option]')
			await expect(options.first()).toBeFocused()
		})

		test('ArrowDown navigates through options', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(options.nth(2)).toBeFocused()
		})

		test('ArrowUp navigates back through options', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')
			await expect(options.first()).toBeFocused()

			// Go to third, then back
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(2)).toBeFocused()
			await page.keyboard.press('ArrowUp')
			await expect(options.nth(1)).toBeFocused()
		})

		test('Home and End navigate to first/last option', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('End')
			await expect(options.last()).toBeFocused()

			await page.keyboard.press('Home')
			await expect(options.first()).toBeFocused()
		})

		test('Enter selects option and closes dropdown', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')
			await expect(options.first()).toBeFocused()

			await page.keyboard.press('ArrowDown') // Banana
			await expect(options.nth(1)).toBeFocused()
			await page.keyboard.press('Enter')

			await expect(dropdown).not.toBeVisible()
			// Trigger should show selected value
			const valueText = page.locator('[data-select-value]').first()
			await expect(valueText).toContainText('Banana')
		})

		test('Escape closes dropdown and returns focus to trigger', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-select-dropdown]').first()
			await expect(dropdown).toBeVisible()
			await expect(dropdown.locator('[data-select-option]').first()).toBeFocused()

			await page.keyboard.press('Escape')
			await expect(dropdown).not.toBeVisible()
			await expect(trigger).toBeFocused()
		})

		test('End key scrolls last option into view in overflow dropdown', async ({ page }) => {
			// Use the grouped select (2nd on page) which has 6 items + 2 group headers with maxRows=5
			const select = page.locator('[data-select]').nth(1)
			const trigger = select.locator('[data-select-trigger]')
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = select.locator('[data-select-dropdown]')
			await expect(dropdown).toBeVisible()
			const options = dropdown.locator('[data-select-option]')
			await expect(options.first()).toBeFocused()

			// Jump to last item
			await page.keyboard.press('End')
			await expect(options.last()).toBeFocused()

			// Wait for scrollIntoView (navigator uses setTimeout(..., 0))
			await page.waitForTimeout(100)

			// Assert the last option is within the visible area of the dropdown
			const dropdownBox = await dropdown.boundingBox()
			const lastOptionBox = await options.last().boundingBox()
			expect(dropdownBox).toBeTruthy()
			expect(lastOptionBox).toBeTruthy()
			expect(lastOptionBox!.y + lastOptionBox!.height).toBeLessThanOrEqual(
				dropdownBox!.y + dropdownBox!.height + 1 // 1px tolerance for rounding
			)
			expect(lastOptionBox!.y).toBeGreaterThanOrEqual(dropdownBox!.y - 1)
		})

		test('reopening focuses previously selected item', async ({ page }) => {
			const trigger = page.locator('[data-select-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-select-dropdown]').first()
			const options = dropdown.locator('[data-select-option]')
			await expect(options.first()).toBeFocused()

			// Select third item (Cherry)
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(options.nth(2)).toBeFocused()
			await page.keyboard.press('Enter')
			await expect(dropdown).not.toBeVisible()

			// Reopen
			await page.keyboard.press('ArrowDown')
			await expect(dropdown).toBeVisible()
			// Cherry should be focused
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

			// Reopen and verify check mark
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
