import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('StatusList', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'status-list')
	})

	// ─── Rendering ───────────────────────────────────────────────────────────

	test.describe('rendering', () => {
		test('renders root with data-status-list', async ({ page }) => {
			await expect(page.locator('[data-status-list]').first()).toBeVisible()
		})

		test('renders all four status items', async ({ page }) => {
			const items = page.locator('[data-status-list] [data-status-item]')
			await expect(items).toHaveCount(4)
		})

		test('items have correct data-status attributes', async ({ page }) => {
			const items = page.locator('[data-status-list] [data-status-item]')
			await expect(items.nth(0)).toHaveAttribute('data-status', 'pass')
			await expect(items.nth(1)).toHaveAttribute('data-status', 'fail')
			await expect(items.nth(2)).toHaveAttribute('data-status', 'warn')
			await expect(items.nth(3)).toHaveAttribute('data-status', 'unknown')
		})

		test('root has role="status"', async ({ page }) => {
			await expect(page.locator('[data-status-list]').first()).toHaveAttribute('role', 'status')
		})
	})

	// ─── Visual snapshots ────────────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode}`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)
					const el = page.locator('[data-status-list]').first()
					await expect(el).toHaveScreenshot(`status-list-${theme}-${mode}.png`)
				})
			}
		}
	})
})
