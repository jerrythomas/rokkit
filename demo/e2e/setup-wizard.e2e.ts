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

	// ─── Full-page: Folders (default step) ──────────────────────────

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

	// ─── Navigate to Welcome (step 0) — click first completed stage ──

	test('setup-welcome-light', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		// Navigate back to welcome by clicking the first .stage.completed button in the rail
		await page.locator('.rail-stages .stage.completed').first().click()
		await page.waitForTimeout(200)
		await expect(page).toHaveScreenshot('setup-welcome-light.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	test('setup-welcome-ar-rtl', async ({ page }) => {
		await goTo(page, '/setup', 'ar')
		await setMode(page, 'light')
		// Navigate back to welcome by clicking the first .stage.completed button in the rail
		await page.locator('.rail-stages .stage.completed').first().click()
		await page.waitForTimeout(200)
		await expect(page).toHaveScreenshot('setup-welcome-ar-rtl.png', {
			fullPage: true,
			animations: 'disabled'
		})
	})

	// ─── Navigate to Projects (step 5) — click Continue twice ───────

	test('setup-projects-light', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		// Navigate forward 2 times from folders (step 3) to projects (step 5)
		const continueBtn = page.locator('.wiz-bottom .btn-solid')
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
		// Navigate to projects step (2x Continue) first
		const continueBtn = page.locator('.wiz-bottom .btn-solid')
		await continueBtn.click()
		await continueBtn.click()
		await page.waitForTimeout(200)
		const rail = page.locator('aside.wiz-rail')
		await expect(rail).toHaveScreenshot('setup-stepper-mid.png', {
			animations: 'disabled'
		})
	})
})
