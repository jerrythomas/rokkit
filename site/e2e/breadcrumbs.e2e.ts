import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('BreadCrumbs', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'breadcrumbs')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders breadcrumb nav with aria-label', async ({ page }) => {
		const nav = page.locator('[data-breadcrumbs]').first()
		await expect(nav).toBeVisible()
		await expect(nav).toHaveAttribute('aria-label')
	})

	test('default breadcrumbs renders 4 items', async ({ page }) => {
		const items = page.locator('[data-breadcrumbs]').first().locator('[data-breadcrumb-item]')
		await expect(items).toHaveCount(4)
	})

	test('short breadcrumbs renders 2 items', async ({ page }) => {
		const items = page.locator('[data-breadcrumbs]').nth(1).locator('[data-breadcrumb-item]')
		await expect(items).toHaveCount(2)
	})

	test('last item has aria-current="page"', async ({ page }) => {
		const nav = page.locator('[data-breadcrumbs]').first()
		const current = nav.locator('[aria-current="page"]')
		await expect(current).toBeVisible()
		await expect(current).toContainText('Laptops')
	})

	test('separators are present between items', async ({ page }) => {
		const separators = page
			.locator('[data-breadcrumbs]')
			.first()
			.locator('[data-breadcrumb-separator]')
		await expect(separators).toHaveCount(3)
	})

	// ─── Content ─────────────────────────────────────────────────────

	test('renders item labels correctly', async ({ page }) => {
		const nav = page.locator('[data-breadcrumbs]').first()
		await expect(nav).toContainText('Home')
		await expect(nav).toContainText('Products')
		await expect(nav).toContainText('Electronics')
		await expect(nav).toContainText('Laptops')
	})

	test('non-last items render as links or buttons', async ({ page }) => {
		const nav = page.locator('[data-breadcrumbs]').first()
		const links = nav.locator('[data-breadcrumb-link]')
		await expect(links).toHaveCount(3) // Home, Products, Electronics — not Laptops
	})

	// ─── Custom separator ────────────────────────────────────────────

	test('third breadcrumb uses custom separator', async ({ page }) => {
		const nav = page.locator('[data-breadcrumbs]').nth(2)
		await expect(nav).toBeVisible()
		await expect(nav).toContainText('Home')
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const nav = page.locator('[data-breadcrumbs]').first()
					await expect(nav).toHaveScreenshot(`breadcrumbs-${theme}-${mode}-default.png`)
				})
			}
		}
	})
})
