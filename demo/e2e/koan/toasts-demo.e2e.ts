import { expect, test } from '@playwright/test'

test('toasts demo: clicking success triggers a success toast', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('toast')
	await input.press('Enter')

	// Wait for the lazy-loaded demo component to render
	await expect(page.getByRole('button', { name: 'Show success' })).toBeVisible({ timeout: 10000 })

	await page.getByRole('button', { name: 'Show success' }).click()

	// AlertList portals to document.body; Message renders role="status" for success
	await expect(page.locator('[data-message-root]').first()).toBeVisible({ timeout: 3000 })
})

test('toasts demo: clicking error triggers an error toast', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('toast')
	await input.press('Enter')

	await expect(page.getByRole('button', { name: 'Show error' })).toBeVisible({ timeout: 10000 })

	await page.getByRole('button', { name: 'Show error' }).click()

	// Message renders role="alert" for error
	await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 3000 })
})

test('toasts demo: intro text is present', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('toast')
	await input.press('Enter')

	await expect(page.getByRole('button', { name: 'Show success' })).toBeVisible({ timeout: 10000 })
	await expect(page.getByText(/short, time-limited feedback/i)).toBeVisible()
})
