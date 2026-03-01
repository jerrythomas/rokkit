import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// ─── Play page tests ──────────────────────────────────────────────────────────

test.describe('Toggle — play page', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'toggle')
	})

	// ─── Keyboard navigation ─────────────────────────────────────────────

	test('ArrowRight moves focus through options', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').first()
		const options = toggle.locator('[data-toggle-option]')
		await options.first().focus()

		await page.keyboard.press('ArrowRight')
		await expect(options.nth(1)).toBeFocused()

		await page.keyboard.press('ArrowRight')
		await expect(options.nth(2)).toBeFocused()
	})

	test('ArrowLeft moves focus back', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').first()
		const options = toggle.locator('[data-toggle-option]')
		await options.nth(2).focus()

		await page.keyboard.press('ArrowLeft')
		await expect(options.nth(1)).toBeFocused()

		await page.keyboard.press('ArrowLeft')
		await expect(options.nth(0)).toBeFocused()
	})

	test('Home moves to first option', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').first()
		const options = toggle.locator('[data-toggle-option]')
		await options.nth(2).focus()
		await page.keyboard.press('Home')
		await expect(options.first()).toBeFocused()
	})

	test('End moves to last option', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').first()
		const options = toggle.locator('[data-toggle-option]')
		await options.first().focus()
		await page.keyboard.press('End')
		await expect(options.last()).toBeFocused()
	})

	test('Enter selects focused option', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').first()
		const options = toggle.locator('[data-toggle-option]')
		await options.first().focus()
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('Enter')
		await expect(options.nth(1)).toHaveAttribute('data-selected')
	})

	// ─── Mouse interaction ───────────────────────────────────────────────

	test('click selects an option', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').first()
		const options = toggle.locator('[data-toggle-option]')
		await options.nth(1).click()
		await expect(options.nth(1)).toHaveAttribute('data-selected')
	})

	test('clicking already selected option keeps it selected', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').first()
		const options = toggle.locator('[data-toggle-option]')
		// First option should be selected by default
		await options.first().click()
		await expect(options.first()).toHaveAttribute('data-selected')
	})

	// ─── Text-only toggle ────────────────────────────────────────────────

	test('text-only toggle renders labels', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').nth(1)
		const options = toggle.locator('[data-toggle-option]')
		await expect(options).toHaveCount(4)
		await expect(options.first()).toContainText('Daily')
		await expect(options.last()).toContainText('Yearly')
	})

	test('text-only toggle keyboard navigation works', async ({ page }) => {
		const toggle = page.locator('.preview-area [data-toggle]').nth(1)
		const options = toggle.locator('[data-toggle-option]')
		await options.first().focus()
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('Enter')
		await expect(options.nth(1)).toHaveAttribute('data-selected')
	})
})

// ─── Learn page tests ─────────────────────────────────────────────────────────

test.describe('Toggle — learn page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/components/toggle')
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
		await page.waitForURL('**/toggle/play')
		await expect(page.locator('.preview-area [data-toggle]').first()).toBeVisible()
	})
})
