import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

// ─── Play page tests ──────────────────────────────────────────────────────────

test.describe('UploadProgress — play page', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'upload-progress')
	})

	test('renders upload progress in preview area', async ({ page }) => {
		const progress = page.locator('.preview-area [data-upload-progress]')
		await expect(progress).toBeVisible()
	})

	test('shows file items with status', async ({ page }) => {
		const items = page.locator('.preview-area [data-upload-file-status]')
		const count = await items.count()
		expect(count).toBeGreaterThan(0)
	})

	test('header shows file count', async ({ page }) => {
		const header = page.locator('.preview-area [data-upload-header]')
		await expect(header).toContainText('files')
	})

	test('action buttons are visible', async ({ page }) => {
		const actions = page.locator('.preview-area [data-upload-actions]')
		const count = await actions.count()
		expect(count).toBeGreaterThan(0)
	})

	test('clear button removes all files', async ({ page }) => {
		const clear = page.locator('.preview-area [data-upload-clear]')
		await clear.click()
		await expect(page.locator('.preview-area [data-upload-file-status]')).toHaveCount(0)
	})
	// ─── Visual snapshots ───────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} — list view`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)
					const progress = page.locator('.preview-area [data-upload-progress]')
					await expect(progress).toHaveScreenshot(`upload-progress-${theme}-${mode}-list.png`)
				})
			}
		}
	})
})

// ─── Learn page tests ─────────────────────────────────────────────────────────

test.describe('UploadProgress — learn page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/docs/components/upload-progress')
		await page.waitForLoadState('networkidle')
	})

	test('renders story viewers', async ({ page }) => {
		const stories = page.locator('[data-story-root]')
		await expect(stories.first()).toBeVisible()
	})
})
