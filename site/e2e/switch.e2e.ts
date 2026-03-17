import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Switch', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'switch')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders switch components', async ({ page }) => {
		const switches = page.locator('.preview-area [data-switch]')
		await expect(switches).toHaveCount(3)
	})

	test('boolean switch starts in off state', async ({ page }) => {
		const sw = page.locator('.preview-area [data-switch]').first()
		// Off state: aria-checked false
		await expect(sw).toHaveAttribute('aria-checked', 'false')
	})

	// ─── Mouse interaction ───────────────────────────────────────────

	test('clicking boolean switch toggles it on', async ({ page }) => {
		const sw = page.locator('.preview-area [data-switch]').first()
		await sw.click()

		await expect(sw).toHaveAttribute('aria-checked', 'true')
	})

	test('clicking boolean switch twice toggles back off', async ({ page }) => {
		const sw = page.locator('.preview-area [data-switch]').first()
		await sw.click()
		await sw.click()

		await expect(sw).toHaveAttribute('aria-checked', 'false')
	})

	test('boolean value shown in info field after toggle', async ({ page }) => {
		const sw = page.locator('.preview-area [data-switch]').first()
		await sw.click()

		await expect(page.locator('aside')).toContainText('true')
	})

	// ─── Keyboard interaction ────────────────────────────────────────

	test('Enter toggles the switch', async ({ page }) => {
		const sw = page.locator('.preview-area [data-switch]').first()
		await sw.focus()
		await page.keyboard.press('Enter')

		await expect(sw).toHaveAttribute('aria-checked', 'true')
	})

	test('Space toggles the switch', async ({ page }) => {
		const sw = page.locator('.preview-area [data-switch]').first()
		await sw.focus()
		await page.keyboard.press('Space')

		await expect(sw).toHaveAttribute('aria-checked', 'true')
	})

	// ─── Text options switch ─────────────────────────────────────────

	test('text options switch cycles on click', async ({ page }) => {
		const sw = page.locator('.preview-area [data-switch]').nth(1)
		// Starts on 'off' (first option)
		await sw.click()

		await expect(sw).toHaveAttribute('aria-checked', 'true')
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - off state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const sw = page.locator('.preview-area [data-switch]').first()
					await expect(sw).toHaveScreenshot(`switch-${theme}-${mode}-off.png`)
				})

				test(`${theme}/${mode} - on state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const sw = page.locator('.preview-area [data-switch]').first()
					await sw.click()
					await expect(sw).toHaveScreenshot(`switch-${theme}-${mode}-on.png`)
				})
			}
		}
	})
})
