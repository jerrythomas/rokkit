import { test, expect } from '@playwright/test'
import { goTo, setMode, setStyle } from './helpers'
import type { Style } from './helpers'

test.describe('Settings Page', () => {
	// ─── Smoke ──────────────────────────────────────────────────────

	test('page loads', async ({ page }) => {
		await goTo(page, '/settings')
		await expect(page.locator('h1')).toContainText('Settings')
	})

	test('shows 5 theme cards', async ({ page }) => {
		await goTo(page, '/settings')
		const cards = page.locator('section').first().locator('button')
		await expect(cards).toHaveCount(5)
	})

	test('shows appearance controls', async ({ page }) => {
		await goTo(page, '/settings')
		await expect(page.getByText('Mode', { exact: true })).toBeVisible()
		await expect(page.getByText('Density', { exact: true })).toBeVisible()
		await expect(page.getByText('Corners', { exact: true })).toBeVisible()
	})

	// ─── Theme switching ─────────────────────────────────────────────

	test('clicking a theme card applies data-style to body', async ({ page }) => {
		await goTo(page, '/settings')
		await page.locator('button:has-text("Rokkit")').click()
		const style = await page.evaluate(() => document.body.dataset.style)
		expect(style).toBe('rokkit')
	})

	test('clicking Dark applies data-mode to body', async ({ page }) => {
		await goTo(page, '/settings')
		await page.locator('button', { hasText: 'Dark' }).nth(0).click()
		const mode = await page.evaluate(() => document.body.dataset.mode)
		expect(mode).toBe('dark')
	})

	test('clicking Compact applies data-density to body', async ({ page }) => {
		await goTo(page, '/settings')
		await page.locator('button:has-text("Compact")').click()
		const density = await page.evaluate(() => document.body.dataset.density)
		expect(density).toBe('compact')
	})

	test('clicking Rounded applies data-radius to body', async ({ page }) => {
		await goTo(page, '/settings')
		await page.locator('button:has-text("Rounded")').click()
		const radius = await page.evaluate(() => document.body.dataset.radius)
		expect(radius).toBe('rounded')
	})

	// ─── Snapshots ───────────────────────────────────────────────────

	test('settings-light', async ({ page }) => {
		await goTo(page, '/settings')
		await setMode(page, 'light')
		await expect(page).toHaveScreenshot('settings-light.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	test('settings-dark', async ({ page }) => {
		await goTo(page, '/settings')
		await setMode(page, 'dark')
		await expect(page).toHaveScreenshot('settings-dark.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})
})

// ─── Cross-theme snapshots of Observatory ─────────────────────────────────────

test.describe('Cross-Theme Visual Regression', () => {
	type ThemeCase = { style: Style; mode: 'light' | 'dark'; tag: string }

	const themeCases: ThemeCase[] = [
		{ style: 'zen-sumi',  mode: 'light',  tag: 'zen-sumi-light' },
		{ style: 'zen-sumi',  mode: 'dark',   tag: 'zen-sumi-dark' },
		{ style: 'rokkit',    mode: 'light',  tag: 'rokkit-light' },
		{ style: 'rokkit',    mode: 'dark',   tag: 'rokkit-dark' },
		{ style: 'minimal',   mode: 'light',  tag: 'minimal-light' },
		{ style: 'minimal',   mode: 'dark',   tag: 'minimal-dark' },
		{ style: 'material',  mode: 'light',  tag: 'material-light' },
		{ style: 'material',  mode: 'dark',   tag: 'material-dark' },
		{ style: 'frosted',   mode: 'light',  tag: 'frosted-light' },
		{ style: 'frosted',   mode: 'dark',   tag: 'frosted-dark' },
	]

	for (const { style, mode, tag } of themeCases) {
		test(`observatory — ${tag}`, async ({ page }) => {
			await goTo(page, '/observatory')
			await setStyle(page, style)
			await setMode(page, mode)
			await expect(page).toHaveScreenshot(`cross-theme-observatory-${tag}.png`, {
				fullPage: true,
				animations: 'disabled'
			})
		})
	}

	// Settings page — one snapshot per theme (light only, readable)
	const themeStyles: Style[] = ['zen-sumi', 'rokkit', 'minimal', 'material', 'frosted']

	for (const style of themeStyles) {
		test(`settings page — ${style}`, async ({ page }) => {
			await goTo(page, '/settings')
			await setStyle(page, style)
			await setMode(page, 'light')
			await expect(page).toHaveScreenshot(`cross-theme-settings-${style}.png`, {
				fullPage: true,
				animations: 'disabled'
			})
		})
	}
})
