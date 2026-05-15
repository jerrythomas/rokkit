import { expect, test } from '@playwright/test'

async function openTabsDemo(page: any) {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')
	// Wait for the single preview area to be visible
	await expect(page.locator('.preview')).toBeVisible({ timeout: 10000 })
}

test('tabs demo renders a single preview (not two side-by-side)', async ({ page }) => {
	await openTabsDemo(page)

	// There should be exactly one .preview element
	await expect(page.locator('.preview')).toHaveCount(1)

	// The old "With icons" and "Simple" headings should NOT be present
	await expect(page.getByText('With icons')).not.toBeVisible()
	await expect(page.getByText('Simple')).not.toBeVisible()

	// The Tabs component should render tab buttons
	await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
	await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible()
	await expect(page.getByRole('tab', { name: 'Activity' })).toBeVisible()
})

test('tabs demo shows Layout and Field mapping control groups', async ({ page }) => {
	await openTabsDemo(page)

	// Both fieldset legends must be present
	await expect(page.locator('legend', { hasText: 'Layout' })).toBeVisible()
	await expect(page.locator('legend', { hasText: 'Field mapping' })).toBeVisible()

	// Layout controls
	await expect(page.locator('label', { hasText: 'Orientation' }).first()).toBeVisible()
	await expect(page.locator('label', { hasText: 'Position' }).first()).toBeVisible()
	await expect(page.locator('label', { hasText: 'Align' }).first()).toBeVisible()
	await expect(page.locator('label', { hasText: 'Disabled' }).first()).toBeVisible()

	// Field mapping controls
	await expect(page.locator('label', { hasText: 'Icon field' }).first()).toBeVisible()
	await expect(page.locator('label', { hasText: 'Show icons' }).first()).toBeVisible()
})

test('tabs demo has collapsible data preview', async ({ page }) => {
	await openTabsDemo(page)

	const details = page.locator('details.data')
	await expect(details).toBeVisible()
	await expect(details.locator('summary')).toHaveText('Data preview')
})

test('tabs demo intro mentions field mapping and image', async ({ page }) => {
	await openTabsDemo(page)

	await expect(page.locator('.intro')).toContainText('field mapping')
	await expect(page.locator('.intro')).toContainText('image')
})

test('tabs demo switches panels', async ({ page }) => {
	await openTabsDemo(page)

	await page.getByRole('tab', { name: 'Settings' }).click()
	await expect(page.locator('[data-tabs-content]', { hasText: 'Configure your preferences here.' })).toBeVisible()
})
