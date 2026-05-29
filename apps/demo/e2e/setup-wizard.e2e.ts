import { test, expect } from '@playwright/test'
import { goTo, setMode } from './helpers'

test.describe('Setup Wizard', () => {
	// ─── Smoke ──────────────────────────────────────────────────────

	test('wizard loads with stepper rail visible', async ({ page }) => {
		await goTo(page, '/setup')
		await expect(page.locator('aside.wiz-rail')).toBeVisible()
	})

	test('wizard shows content area', async ({ page }) => {
		await goTo(page, '/setup')
		await expect(page.locator('.wiz-content')).toBeVisible()
	})

	test('wizard shows progress bar', async ({ page }) => {
		await goTo(page, '/setup')
		await expect(page.locator('.wiz-bottom')).toBeVisible()
	})

	// ─── Full-page: Folders (default step, currentStep=3) ───────────

	test('setup-folders-light', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		await expect(page).toHaveScreenshot('setup-folders-light.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	test('setup-folders-dark', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'dark')
		await expect(page).toHaveScreenshot('setup-folders-dark.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	// ─── Navigate to Welcome (step 0) via Back button ───────────────

	test('setup-welcome-light', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		// currentStep starts at 3 (Folders). Click Back 3× to reach Welcome (step 0).
		const backBtn = page.locator('.wiz-bottom [data-button]').first()
		await backBtn.click()
		await backBtn.click()
		await backBtn.click()
		await page.waitForTimeout(200)
		await expect(page).toHaveScreenshot('setup-welcome-light.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	test('setup-welcome-ar-rtl', async ({ page }) => {
		await goTo(page, '/setup', 'ar')
		await setMode(page, 'light')
		const backBtn = page.locator('.wiz-bottom [data-button]').first()
		await backBtn.click()
		await backBtn.click()
		await backBtn.click()
		await page.waitForTimeout(200)
		await expect(page).toHaveScreenshot('setup-welcome-ar-rtl.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	// ─── Navigate to Projects (step 5) — Continue twice from Folders ─

	test('setup-projects-light', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		// Step 3=Folders requires ≥1 folder before Continue is enabled. It's pre-populated.
		const continueBtn = page.locator('.wiz-bottom [data-button]').last()
		await continueBtn.click()
		await continueBtn.click()
		await page.waitForTimeout(200)
		await expect(page).toHaveScreenshot('setup-projects-light.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	// ─── Section snapshots (English, light, default folders step) ───

	test('section: stepper rail', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		const rail = page.locator('aside.wiz-rail')
		await expect(rail).toHaveScreenshot('setup-stepper-rail.png', {
			animations: 'disabled'
		})
	})

	test('section: stepper rail mid-wizard', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		const continueBtn = page.locator('.wiz-bottom [data-button]').last()
		await continueBtn.click()
		await continueBtn.click()
		await page.waitForTimeout(200)
		const rail = page.locator('aside.wiz-rail')
		await expect(rail).toHaveScreenshot('setup-stepper-mid.png', {
			animations: 'disabled'
		})
	})
})
