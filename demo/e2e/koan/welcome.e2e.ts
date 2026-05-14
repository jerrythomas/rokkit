import { expect, test } from '@playwright/test'

test('welcome state shows enso, tagline, and centered input; no sidebar', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByText('○')).toBeVisible()
	await expect(page.getByText('start with a word')).toBeVisible()
	await expect(page.getByPlaceholder('type here…')).toBeVisible()
	await expect(page.locator('aside.chat-panel')).toHaveCount(0)
})

test('typing a query and pressing Enter migrates to active state', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')
	await expect(page.locator('aside.chat-panel')).toBeVisible()
	await expect(page.getByText('Tabs (placeholder)')).toBeVisible()
})
