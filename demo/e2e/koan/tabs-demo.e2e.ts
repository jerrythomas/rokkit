import { expect, test } from '@playwright/test'

test('tabs demo renders two orientations and switches panels', async ({ page }) => {
	await page.goto('/')
	// Activate the tabs demo by typing into the query input
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')

	// Wait for the lazy-loaded demo component to render
	await expect(page.getByRole('heading', { name: 'Tabs', level: 1 })).toBeVisible({ timeout: 10000 })
	await expect(page.getByText('Horizontal (default)')).toBeVisible()
	await expect(page.getByText('Vertical')).toBeVisible()

	// Switch tab in horizontal example
	const horizontal = page.locator('.example', { hasText: 'Horizontal (default)' })
	await horizontal.getByRole('tab', { name: 'Second' }).click()
	await expect(horizontal.getByText('Content of the second tab.')).toBeVisible()
})
