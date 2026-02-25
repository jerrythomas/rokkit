import { test, expect } from '@playwright/test'
import { goToComponent, setTheme, setMode, themes, modes } from './helpers'

test.describe('Menu', () => {
	test.beforeEach(async ({ page }) => {
		await goToComponent(page, 'menu')
	})

	// ─── Keyboard navigation ────────────────────────────────────────

	test.describe('keyboard navigation', () => {
		test('ArrowDown opens menu and focuses first item', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-menu-dropdown]').first()
			await expect(dropdown).toBeVisible()
			const items = dropdown.locator('[data-menu-item]')
			await expect(items.first()).toBeFocused()
		})

		test('ArrowDown navigates through items', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-menu-dropdown]').first()
			const items = dropdown.locator('[data-menu-item]')
			await expect(items.first()).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(2)).toBeFocused()
		})

		test('ArrowUp navigates back through items', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-menu-dropdown]').first()
			const items = dropdown.locator('[data-menu-item]')
			await expect(items.first()).toBeFocused()

			// Navigate to third item
			await page.keyboard.press('ArrowDown')
			await expect(items.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(items.nth(2)).toBeFocused()

			// Navigate back
			await page.keyboard.press('ArrowUp')
			await expect(items.nth(1)).toBeFocused()
		})

		test('Home moves to first item', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-menu-dropdown]').first()
			const items = dropdown.locator('[data-menu-item]')
			await expect(items.first()).toBeFocused()

			await page.keyboard.press('End')
			await expect(items.last()).toBeFocused()
			await page.keyboard.press('Home')
			await expect(items.first()).toBeFocused()
		})

		test('End moves to last item', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-menu-dropdown]').first()
			const items = dropdown.locator('[data-menu-item]')
			await expect(items.first()).toBeFocused()

			await page.keyboard.press('End')
			await expect(items.last()).toBeFocused()
		})

		test('Enter selects item and closes menu', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-menu-dropdown]').first()
			const items = dropdown.locator('[data-menu-item]')
			await expect(items.first()).toBeFocused()

			await page.keyboard.press('ArrowDown') // focus second item (Copy)
			await expect(items.nth(1)).toBeFocused()
			await page.keyboard.press('Enter')

			await expect(dropdown).not.toBeVisible()
		})

		test('Escape closes menu and returns focus to trigger', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()
			await page.keyboard.press('ArrowDown')

			const dropdown = page.locator('[data-menu-dropdown]').first()
			await expect(dropdown).toBeVisible()
			await expect(dropdown.locator('[data-menu-item]').first()).toBeFocused()

			await page.keyboard.press('Escape')
			await expect(dropdown).not.toBeVisible()
			await expect(trigger).toBeFocused()
		})

		test('Enter/Space on trigger toggles menu', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.focus()

			await page.keyboard.press('Enter')
			const dropdown = page.locator('[data-menu-dropdown]').first()
			await expect(dropdown).toBeVisible()

			await page.keyboard.press('Escape')
			await expect(dropdown).not.toBeVisible()

			await page.keyboard.press('Space')
			await expect(dropdown).toBeVisible()
		})
	})

	// ─── Mouse interaction ──────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click on trigger opens menu', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-menu-dropdown]').first()
			await expect(dropdown).toBeVisible()
		})

		test('click on item selects and closes menu', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-menu-dropdown]').first()
			const items = dropdown.locator('[data-menu-item]')
			await items.nth(1).click()

			await expect(dropdown).not.toBeVisible()
		})

		test('click outside closes menu', async ({ page }) => {
			const trigger = page.locator('[data-menu-trigger]').first()
			await trigger.click()

			const dropdown = page.locator('[data-menu-dropdown]').first()
			await expect(dropdown).toBeVisible()

			await page.locator('body').click({ position: { x: 10, y: 10 } })
			await expect(dropdown).not.toBeVisible()
		})
	})

	// ─── Visual snapshots ───────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - open state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const trigger = page.locator('[data-menu-trigger]').first()
					await trigger.click()

					const menu = page.locator('[data-menu]').first()
					await expect(menu).toHaveScreenshot(`menu-${theme}-${mode}-open.png`)
				})
			}
		}
	})
})
