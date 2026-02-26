import { test, expect } from '@playwright/test'

test.describe('Sidebar navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
	})

	// ─── Active state ────────────────────────────────────────────────

	test('active item reflects current route on load', async ({ page }) => {
		await page.goto('/components/button')
		await page.waitForLoadState('networkidle')

		const sidebar = page.locator('[data-sidebar] [data-list]')
		const activeItem = sidebar.locator('[data-list-item][data-active]')
		await expect(activeItem).toHaveCount(1)
		await expect(activeItem).toHaveAttribute('href', '/components/button')
	})

	// ─── Click navigation ────────────────────────────────────────────

	test('clicking a sidebar item navigates to its page', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const menuLink = sidebar.locator('[data-list-item][href="/components/menu"]')
		await menuLink.click()

		await expect(page).toHaveURL('/components/menu')
	})

	test('active item updates after click navigation', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const selectLink = sidebar.locator('[data-list-item][href="/components/select"]')
		await selectLink.click()

		await page.waitForURL('/components/select')

		const activeItem = sidebar.locator('[data-list-item][data-active]')
		await expect(activeItem).toHaveAttribute('href', '/components/select')
	})

	// ─── Keyboard: Arrow navigation ──────────────────────────────────

	test('ArrowDown moves focus through sidebar items', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const items = sidebar.locator('[data-list-item]')

		await items.first().focus()
		await expect(items.first()).toBeFocused()

		await page.keyboard.press('ArrowDown')
		await expect(items.nth(1)).toBeFocused()

		await page.keyboard.press('ArrowDown')
		await expect(items.nth(2)).toBeFocused()
	})

	test('ArrowUp moves focus back through sidebar items', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const items = sidebar.locator('[data-list-item]')

		await items.nth(2).focus()
		await page.keyboard.press('ArrowUp')
		await expect(items.nth(1)).toBeFocused()

		await page.keyboard.press('ArrowUp')
		await expect(items.first()).toBeFocused()
	})

	test('Home moves focus to first item', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const items = sidebar.locator('[data-list-item]')

		await items.nth(3).focus()
		await page.keyboard.press('Home')
		await expect(items.first()).toBeFocused()
	})

	test('End moves focus to last item', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const items = sidebar.locator('[data-list-item]')

		await items.first().focus()
		await page.keyboard.press('End')
		await expect(items.last()).toBeFocused()
	})

	// ─── Keyboard: Enter/Space on href items ─────────────────────────

	test('Enter on focused sidebar item navigates to its page', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const items = sidebar.locator('[data-list-item]')

		// Focus first item (Button) and press Enter
		await items.first().focus()
		await page.keyboard.press('Enter')

		await expect(page).toHaveURL('/components/button')
	})

	test('Enter navigates to correct page after ArrowDown', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const items = sidebar.locator('[data-list-item]')

		// Focus first item (Button) then move down to FloatingAction
		await items.first().focus()
		await page.keyboard.press('ArrowDown')
		await expect(items.nth(1)).toBeFocused()
		await page.keyboard.press('Enter')

		await expect(page).toHaveURL('/components/floating-action')
	})

	test('Enter does not preventDefault — page navigates successfully', async ({ page }) => {
		const sidebar = page.locator('[data-sidebar] [data-list]')
		const items = sidebar.locator('[data-list-item]')

		await items.first().focus()

		// Track whether navigation occurs (no stuck on same URL)
		const currentUrl = page.url()
		await page.keyboard.press('Enter')
		await page.waitForURL('/components/button')

		// URL changed — browser navigation was not blocked
		expect(page.url()).not.toBe(currentUrl)
	})
})
