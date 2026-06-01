import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Range', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'range')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders single slider', async ({ page }) => {
		const range = page.locator('[data-range]').first()
		await expect(range).toBeVisible()
	})

	test('single slider starts at value 50', async ({ page }) => {
		await expect(page.locator('.preview-area')).toContainText('Value: 50')
	})

	test('range slider starts with lower=20 and upper=80', async ({ page }) => {
		await expect(page.locator('.preview-area')).toContainText('Lower: 20')
		await expect(page.locator('.preview-area')).toContainText('Upper: 80')
	})

	// ─── Keyboard navigation ─────────────────────────────────────────

	test('ArrowRight increases single slider value', async ({ page }) => {
		const thumb = page.locator('[data-range]').first().locator('[data-range-thumb]')
		await thumb.focus()
		await page.keyboard.press('ArrowRight')

		await expect(page.locator('.preview-area')).toContainText('Value: 51')
	})

	test('ArrowLeft decreases single slider value', async ({ page }) => {
		const thumb = page.locator('[data-range]').first().locator('[data-range-thumb]')
		await thumb.focus()
		await page.keyboard.press('ArrowLeft')

		await expect(page.locator('.preview-area')).toContainText('Value: 49')
	})

	test('multiple ArrowRight presses increment correctly', async ({ page }) => {
		const thumb = page.locator('[data-range]').first().locator('[data-range-thumb]')
		await thumb.focus()
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('ArrowRight')

		await expect(page.locator('.preview-area')).toContainText('Value: 53')
	})

	// ─── With tick marks ─────────────────────────────────────────────

	test('third range renders tick marks', async ({ page }) => {
		const ticks = page.locator('[data-range]').nth(2).locator('[data-range-tick]')
		await expect(ticks.first()).toBeVisible()
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const range = page.locator('[data-range]').first()
					await expect(range).toHaveScreenshot(`range-${theme}-${mode}-default.png`)
				})
			}
		}
	})
})
