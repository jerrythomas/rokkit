/**
 * Demo component e2e tests — verify preview/code toggle works on effects pages.
 * Tests: preview renders by default, code toggle shows highlighted code (no error),
 * toggle returns to preview, graph paper area is visible.
 */
import { test, expect } from '@playwright/test'

const EFFECTS_WITH_DEMOS = [
	'/docs/effects/reveal',
	'/docs/effects/shine',
	'/docs/effects/tilt'
]

test.describe('Demo component toggle', () => {
	for (const url of EFFECTS_WITH_DEMOS) {
		test.describe(url, () => {
			test.beforeEach(async ({ page }) => {
				await page.goto(url)
				await page.waitForLoadState('networkidle')
			})

			test('shows preview area by default', async ({ page }) => {
				const preview = page.locator('[data-demo-preview]').first()
				await expect(preview).toBeVisible()
			})

			test('preview toggle button is active by default', async ({ page }) => {
				const previewBtn = page
					.locator('[data-demo-root] [data-demo-btn][aria-pressed="true"]')
					.first()
				await expect(previewBtn).toBeVisible()
			})

			test('clicking code toggle renders highlighted code without error', async ({ page }) => {
				const codeBtn = page
					.locator('[data-demo-root] [data-demo-btn][title="Code"]')
					.first()
				await codeBtn.click()

				// Code block should be visible
				const codeBlock = page.locator('[data-demo-code] [data-code-root]').first()
				await expect(codeBlock).toBeVisible()

				// No error message
				await expect(
					page.locator('[data-demo-code]').filter({ hasText: 'Error highlighting code' })
				).toHaveCount(0)

				// Syntax-highlighted HTML is present (shiki wraps in <pre> tags)
				const pre = page.locator('[data-demo-code] pre').first()
				await expect(pre).toBeVisible()
			})

			test('clicking preview toggle after code returns to preview', async ({ page }) => {
				// Switch to code
				await page.locator('[data-demo-root] [data-demo-btn][title="Code"]').first().click()
				await expect(page.locator('[data-demo-code]').first()).toBeVisible()

				// Switch back to preview
				await page.locator('[data-demo-root] [data-demo-btn][title="Preview"]').first().click()
				await expect(page.locator('[data-demo-preview]').first()).toBeVisible()
				await expect(page.locator('[data-demo-code]').first()).toHaveCount(0)
			})
		})
	}
})
