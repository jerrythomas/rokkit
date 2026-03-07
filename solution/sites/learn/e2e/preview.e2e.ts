import { test, expect } from '@playwright/test'

test.describe('Preview app', () => {
	// ─── /preview redirects ───────────────────────────────────────────

	test('navigating to /preview redirects to /preview/dashboard', async ({ page }) => {
		await page.goto('/preview')
		await page.waitForLoadState('networkidle')
		await expect(page).toHaveURL('/preview/dashboard')
	})

	// ─── Dashboard ───────────────────────────────────────────────────

	test.describe('Dashboard page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/preview/dashboard')
			await page.waitForLoadState('networkidle')
		})

		test('page loads and shows "Nexus" in the header', async ({ page }) => {
			const header = page.locator('header')
			await expect(header).toBeVisible()
			await expect(header).toContainText('Nexus')
		})

		test('dashboard heading is visible', async ({ page }) => {
			await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible()
		})

		test('KPI cards are rendered', async ({ page }) => {
			const cards = page.locator('[data-card]')
			await expect(cards).toHaveCount(6)
		})
	})

	// ─── Projects ────────────────────────────────────────────────────

	test.describe('Projects page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/preview/projects')
			await page.waitForLoadState('networkidle')
		})

		test('page loads and shows the Projects heading', async ({ page }) => {
			await expect(page.locator('h1', { hasText: 'Projects' })).toBeVisible()
		})

		test('task tree is visible', async ({ page }) => {
			await expect(page.locator('[data-tree]')).toBeVisible()
		})
	})

	// ─── ThemePanel ──────────────────────────────────────────────────

	test('ThemePanel toggle button is present on the dashboard', async ({ page }) => {
		await page.goto('/preview/dashboard')
		await page.waitForLoadState('networkidle')
		const toggleBtn = page.locator('button[aria-label="Toggle theme panel"]')
		await expect(toggleBtn).toBeVisible()
	})

	test('ThemePanel opens when the toggle button is clicked', async ({ page }) => {
		await page.goto('/preview/dashboard')
		await page.waitForLoadState('networkidle')
		const toggleBtn = page.locator('button[aria-label="Toggle theme panel"]')
		await toggleBtn.click()
		// The panel contains skin/mode buttons — check for a known skin label
		await expect(page.locator('button', { hasText: 'rokkit' }).first()).toBeVisible()
	})
})
