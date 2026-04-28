import { test, expect } from '@playwright/test'
import { goTo, setMode } from './helpers'
import type { Locale, Mode } from './helpers'

test.describe('Observatory', () => {
	// ─── Smoke ──────────────────────────────────────────────────────

	test('page loads and shows greeting', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.greeting-row')).toBeVisible()
	})

	test('page shows koan card', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.koan-hero')).toBeVisible()
	})

	test('page shows insights', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.insights-col')).toBeVisible()
	})

	test('page shows sessions', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.sessions-section')).toBeVisible()
	})

	// ─── Full-page snapshots ────────────────────────────────────────

	const matrix: Array<{ locale: Locale; mode: Mode; tag: string }> = [
		{ locale: 'en', mode: 'light', tag: 'en-light' },
		{ locale: 'en', mode: 'dark', tag: 'en-dark' },
		{ locale: 'es', mode: 'light', tag: 'es-light' },
		{ locale: 'ar', mode: 'light', tag: 'ar-rtl-light' },
		{ locale: 'ar', mode: 'dark', tag: 'ar-rtl-dark' }
	]

	for (const { locale, mode, tag } of matrix) {
		test(`full page — ${tag}`, async ({ page }) => {
			await goTo(page, '/observatory', locale)
			await setMode(page, mode)
			await expect(page).toHaveScreenshot(`observatory-${tag}.png`, {
				fullPage: true,
				animations: 'disabled'
			})
		})
	}

	// ─── Section-level snapshots (English, light mode) ──────────────

	test('section: sidebar', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const sidebar = page.locator('aside.sidebar')
		await expect(sidebar).toHaveScreenshot('observatory-sidebar.png', {
			animations: 'disabled'
		})
	})

	test('section: koan hero', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const koan = page.locator('.koan-hero')
		await expect(koan).toHaveScreenshot('observatory-koan-hero.png', {
			animations: 'disabled'
		})
	})

	test('section: insights column', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const insights = page.locator('.insights-col')
		await expect(insights).toHaveScreenshot('observatory-insights-col.png', {
			animations: 'disabled'
		})
	})

	test('section: sessions table', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const sessions = page.locator('.sessions-table')
		await expect(sessions).toHaveScreenshot('observatory-sessions-table.png', {
			animations: 'disabled'
		})
	})
})
