import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Stepper', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'stepper')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders all 4 steps', async ({ page }) => {
		const steps = page.locator('[data-stepper-step]')
		await expect(steps).toHaveCount(4)
	})

	test('first two steps are completed on load', async ({ page }) => {
		const completed = page.locator('[data-stepper-step][data-completed]')
		await expect(completed).toHaveCount(2)
	})

	test('step 3 is active on load (current=2)', async ({ page }) => {
		const active = page.locator('[data-stepper-step][data-active]')
		await expect(active).toHaveCount(1)
		await expect(active).toContainText('Preferences')
	})

	// ─── Step display ────────────────────────────────────────────────

	test('step labels are visible', async ({ page }) => {
		const stepper = page.locator('[data-stepper]')
		await expect(stepper).toContainText('Account')
		await expect(stepper).toContainText('Profile')
		await expect(stepper).toContainText('Preferences')
		await expect(stepper).toContainText('Review')
	})

	test('step counter text shows current step', async ({ page }) => {
		await expect(page.locator('.preview-area')).toContainText('Step 3 of 4')
	})

	// ─── Advancing steps ────────────────────────────────────────────

	test('clicking Next advances the stage', async ({ page }) => {
		await page.locator('.preview-area button', { hasText: 'Next' }).click()

		await expect(page.locator('.preview-area')).toContainText('Stage 2 of 3')
	})

	test('clicking Next through all stages advances to next step', async ({ page }) => {
		const next = page.locator('.preview-area button', { hasText: 'Next' })
		// Step 3 (Preferences) has 3 stages — click through all
		await next.click() // stage 2
		await next.click() // stage 3
		await next.click() // advance to step 4

		await expect(page.locator('.preview-area')).toContainText('Step 4 of 4')
	})

	// ─── Reset ──────────────────────────────────────────────────────

	test('Reset button returns to step 1', async ({ page }) => {
		await page.locator('.preview-area button', { hasText: 'Reset' }).click()

		await expect(page.locator('.preview-area')).toContainText('Step 1 of 4')
		const completed = page.locator('[data-stepper-step][data-completed]')
		await expect(completed).toHaveCount(0)
	})

	// ─── Click on step ───────────────────────────────────────────────

	test('clicking a completed step navigates to it', async ({ page }) => {
		const firstStep = page.locator('[data-stepper-step]').first()
		await firstStep.click()

		await expect(page.locator('.preview-area')).toContainText('Step 1 of 4')
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const stepper = page.locator('[data-stepper]')
					await expect(stepper).toHaveScreenshot(`stepper-${theme}-${mode}-default.png`)
				})
			}
		}
	})
})
