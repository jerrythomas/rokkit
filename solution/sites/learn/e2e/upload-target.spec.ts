import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

// ─── Play page tests ──────────────────────────────────────────────────────────

test.describe('UploadTarget — play page', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'upload-target')
	})

	test('renders drop zone in preview area', async ({ page }) => {
		const target = page.locator('.preview-area [data-upload-target]').first()
		await expect(target).toBeVisible()
	})

	test('drop zone has proper ARIA attributes', async ({ page }) => {
		const target = page.locator('.preview-area [data-upload-target]').first()
		await expect(target).toHaveAttribute('role', 'button')
		await expect(target).toHaveAttribute('tabindex', '0')
	})

	test('drop zone is keyboard focusable', async ({ page }) => {
		const target = page.locator('.preview-area [data-upload-target]').first()
		await target.focus()
		await expect(target).toBeFocused()
	})
	// ─── Visual snapshots ───────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} — default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)
					const target = page.locator('.preview-area [data-upload-target]').first()
					await expect(target).toHaveScreenshot(`upload-target-${theme}-${mode}-default.png`)
				})
			}
		}
	})
})

// ─── Learn page tests ─────────────────────────────────────────────────────────

test.describe('UploadTarget — learn page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/components/upload-target')
		await page.waitForLoadState('networkidle')
	})

	test('renders story viewers', async ({ page }) => {
		const stories = page.locator('[data-story-root]')
		await expect(stories.first()).toBeVisible()
	})

	test('Learn/Play toggle navigates to play page', async ({ page }) => {
		const viewToggle = page.locator('[data-view-toggle] [data-toggle]')
		const playOption = viewToggle.locator('[data-toggle-option]').nth(1)
		await playOption.click()
		await page.waitForURL('**/upload-target/play')
		await expect(page.locator('.preview-area [data-upload-target]').first()).toBeVisible()
	})
})
