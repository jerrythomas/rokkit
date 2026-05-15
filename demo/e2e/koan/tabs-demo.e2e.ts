import { expect, test } from '@playwright/test'

test('tabs demo renders two examples and switches panels', async ({ page }) => {
	await page.goto('/')
	// Activate the tabs demo by typing into the query input
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')

	// Wait for the lazy-loaded demo component to render
	await expect(page.getByText('With icons')).toBeVisible({ timeout: 10000 })
	await expect(page.getByText('Simple')).toBeVisible()

	// Switch tab in the icons example
	const iconsExample = page.locator('.example', { hasText: 'With icons' })
	await iconsExample.getByRole('tab', { name: 'Settings' }).click()
	await expect(iconsExample.getByText('Configure your preferences')).toBeVisible()
})

test('tabs demo shows FormRenderer controls', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')

	await expect(page.getByText('With icons')).toBeVisible({ timeout: 10000 })

	// FormRenderer controls should be visible (use label elements for exactness)
	await expect(page.locator('label', { hasText: 'Orientation' }).first()).toBeVisible()
	await expect(page.locator('label', { hasText: 'Position' }).first()).toBeVisible()
	await expect(page.locator('label', { hasText: 'Align' }).first()).toBeVisible()
	await expect(page.locator('label', { hasText: 'Disabled' }).first()).toBeVisible()
})

test('tabs demo shows intro text', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')

	await expect(page.getByText('With icons')).toBeVisible({ timeout: 10000 })
	await expect(page.getByText(/Tabs let you switch between related views/)).toBeVisible()
})
