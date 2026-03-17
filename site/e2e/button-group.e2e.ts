import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('ButtonGroup', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'button-group')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders as a group container', async ({ page }) => {
		const group = page.locator('[data-button-group]').first()
		await expect(group).toBeVisible()
		await expect(group).toHaveAttribute('role', 'group')
	})

	test('renders multiple buttons inside the group', async ({ page }) => {
		const group = page.locator('[data-button-group]').first()
		const buttons = group.locator('[data-button]')
		await expect(buttons).toHaveCount(3)
	})

	// ─── Mouse interaction ───────────────────────────────────────────

	test('clicking a button in the group fires its action', async ({ page }) => {
		const group = page.locator('[data-button-group]').first()
		const copyButton = group.locator('[data-button]').nth(1)
		await copyButton.click()

		await expect(page.locator('text=copy')).toBeVisible()
	})

	test('clicking first button (Cut) fires cut action', async ({ page }) => {
		const group = page.locator('[data-button-group]').first()
		await group.locator('[data-button]').first().click()

		await expect(page.locator('text=cut')).toBeVisible()
	})

	// ─── Keyboard interaction ────────────────────────────────────────

	test('Tab moves focus between buttons', async ({ page }) => {
		const group = page.locator('[data-button-group]').first()
		const first = group.locator('[data-button]').first()
		const second = group.locator('[data-button]').nth(1)

		await first.focus()
		await expect(first).toBeFocused()

		await page.keyboard.press('Tab')
		await expect(second).toBeFocused()
	})

	test('Enter activates focused button', async ({ page }) => {
		const group = page.locator('[data-button-group]').first()
		const third = group.locator('[data-button]').nth(2)
		await third.focus()
		await page.keyboard.press('Enter')

		await expect(page.locator('text=paste')).toBeVisible()
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const group = page.locator('[data-button-group]').first()
					await expect(group).toHaveScreenshot(`button-group-${theme}-${mode}-default.png`)
				})
			}
		}
	})
})
