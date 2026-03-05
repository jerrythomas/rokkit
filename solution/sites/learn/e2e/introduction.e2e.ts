import { test, expect } from '@playwright/test'

test.describe('Introduction page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/welcome/introduction')
		await page.waitForLoadState('networkidle')
	})

	// ─── Page loads without error ────────────────────────────────────

	test('page renders article content', async ({ page }) => {
		await expect(page.locator('[data-article-root]')).toBeVisible()
		await expect(page.locator('[data-article-root] h1')).toContainText('Introduction')
	})

	// ─── StoryViewer loads ───────────────────────────────────────────

	test('StoryViewer preview is visible', async ({ page }) => {
		const preview = page.locator('[data-story-preview]')
		await expect(preview).toBeVisible()
	})

	test('StoryViewer code tabs are visible', async ({ page }) => {
		const codeViewer = page.locator('[data-story-root] [data-tabs]')
		await expect(codeViewer).toBeVisible()
	})

	test('CodeViewer shows at least one file tab', async ({ page }) => {
		const tabs = page.locator('[data-story-root] [data-tabs]')
		const tabTriggers = tabs.locator('[data-tabs-trigger]')
		await expect(tabTriggers.first()).toBeVisible()
	})

	// ─── Interactive List demo ───────────────────────────────────────

	test('List component renders in preview', async ({ page }) => {
		const preview = page.locator('[data-story-preview]')
		const list = preview.locator('[data-list]')
		await expect(list).toBeVisible()
	})

	test('List renders 4 items in preview', async ({ page }) => {
		const preview = page.locator('[data-story-preview]')
		const list = preview.locator('[data-list]')
		const items = list.locator('[data-list-item]')

		await expect(items).toHaveCount(4)
	})

	// ─── Code viewer tabs ────────────────────────────────────────────

	test('switching code tabs shows different content', async ({ page }) => {
		const codeViewer = page.locator('[data-story-root] [data-tabs]')
		const triggers = codeViewer.locator('[data-tabs-trigger]')
		const count = await triggers.count()

		// Only test tab switching if there are multiple files
		if (count > 1) {
			await triggers.first().click()
			const firstPanel = codeViewer.locator('[data-tabs-panel][data-panel-active]')
			const firstCode = await firstPanel.textContent()

			await triggers.nth(1).click()
			const secondPanel = codeViewer.locator('[data-tabs-panel][data-panel-active]')
			const secondCode = await secondPanel.textContent()

			expect(firstCode).not.toEqual(secondCode)
		} else {
			// Single file — just verify panel is active
			const panel = codeViewer.locator('[data-tabs-panel][data-panel-active]')
			await expect(panel).toBeVisible()
		}
	})
})
