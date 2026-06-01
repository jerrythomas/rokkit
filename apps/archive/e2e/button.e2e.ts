import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Button', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'button')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders a button element', async ({ page }) => {
		const btn = page.locator('.preview-area [data-button]')
		await expect(btn).toBeVisible()
	})

	test('displays default label text', async ({ page }) => {
		const btn = page.locator('.preview-area [data-button]')
		await expect(btn).toContainText('Click me')
	})

	// ─── Mouse interaction ───────────────────────────────────────────

	test('click fires the onclick handler', async ({ page }) => {
		const btn = page.locator('.preview-area [data-button]')
		await btn.click()

		// InfoField "Last clicked" should now show a time value
		const info = page.locator('aside')
		await expect(info).not.toContainText('Last clicked—')
	})

	test('disabled button cannot be clicked', async ({ page }) => {
		// Toggle disabled via the form control
		const disabledToggle = page.locator('aside').getByText('Disabled').locator('..')
		await disabledToggle.locator('input[type=checkbox]').check()

		const btn = page.locator('.preview-area [data-button]')
		await expect(btn).toBeDisabled()
	})

	// ─── Keyboard interaction ────────────────────────────────────────

	test('Enter activates the button', async ({ page }) => {
		const btn = page.locator('.preview-area [data-button]')
		await btn.focus()
		await page.keyboard.press('Enter')

		const info = page.locator('aside')
		await expect(info).not.toContainText('Last clicked—')
	})

	test('Space activates the button', async ({ page }) => {
		const btn = page.locator('.preview-area [data-button]')
		await btn.focus()
		await page.keyboard.press('Space')

		const info = page.locator('aside')
		await expect(info).not.toContainText('Last clicked—')
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const btn = page.locator('.preview-area [data-button]')
					await expect(btn).toHaveScreenshot(`button-${theme}-${mode}-default.png`)
				})

				test(`${theme}/${mode} - focused state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					await page.locator('.preview-area [data-button]').focus()
					const btn = page.locator('.preview-area [data-button]')
					await expect(btn).toHaveScreenshot(`button-${theme}-${mode}-focused.png`)
				})
			}
		}
	})
})
