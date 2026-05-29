import { test, expect } from '@playwright/test'
import { goTo, setMode } from './helpers'
import type { Locale, Mode } from './helpers'

test.describe('Sessions', () => {
	// ─── Smoke ──────────────────────────────────────────────────────

	test('page loads and shows retro cards', async ({ page }) => {
		await goTo(page, '/sessions')
		await expect(page.locator('.retro-grid')).toBeVisible()
	})

	test('page shows sessions table', async ({ page }) => {
		await goTo(page, '/sessions')
		await expect(page.locator('.sessions-table')).toBeVisible()
	})

	// ─── Full-page snapshots ────────────────────────────────────────

	const matrix: Array<{ locale: Locale; mode: Mode; tag: string }> = [
		{ locale: 'en', mode: 'light', tag: 'en-light' },
		{ locale: 'en', mode: 'dark', tag: 'en-dark' },
		{ locale: 'ar', mode: 'light', tag: 'ar-rtl-light' }
	]

	for (const { locale, mode, tag } of matrix) {
		test(`full page — ${tag}`, async ({ page }) => {
			await goTo(page, '/sessions', locale)
			await setMode(page, mode)
			await expect(page).toHaveScreenshot(`sessions-${tag}.png`, {
				fullPage: true,
				animations: 'disabled'
			})
		})
	}

	// ─── Section-level snapshots (English, light mode) ──────────────

	test('section: retro digest', async ({ page }) => {
		await goTo(page, '/sessions')
		await setMode(page, 'light')
		const retro = page.locator('.retro-grid')
		await expect(retro).toHaveScreenshot('sessions-retro-grid.png', {
			animations: 'disabled'
		})
	})

	test('section: sessions table', async ({ page }) => {
		await goTo(page, '/sessions')
		await setMode(page, 'light')
		const sessions = page.locator('.sessions-table')
		await expect(sessions).toHaveScreenshot('sessions-sessions-table.png', {
			animations: 'disabled'
		})
	})

	// ─── Filter interaction ──────────────────────────────────────────

	test('filter: click second outcome tab and capture filtered state', async ({ page }) => {
		await goTo(page, '/sessions')
		await setMode(page, 'light')
		// Outcome filter: the first Tabs group. Click the second tab trigger (index 1).
		const outcomeFilter = page.locator('[data-tabs][aria-label="outcome-filter"]')
		const secondTab = outcomeFilter.locator('[data-tabs-trigger]').nth(1)
		await secondTab.click()
		await page.waitForTimeout(300)
		await expect(page).toHaveScreenshot('sessions-filter-shipped.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})
})
