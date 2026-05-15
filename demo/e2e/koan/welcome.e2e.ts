import { expect, test } from '@playwright/test'

test('welcome state shows enso, tagline, input, and Open button; no sidebar', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByText('○')).toBeVisible()
	await expect(page.getByText('start with a word')).toBeVisible()
	await expect(page.getByRole('textbox')).toBeVisible()
	await expect(page.getByRole('button', { name: 'Open' })).toBeVisible()
	await expect(page.locator('aside.chat-panel')).toHaveCount(0)
})

test('typing a query and pressing Enter migrates to active state', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('tabs')
	await input.press('Enter')
	await expect(page.locator('aside.chat-panel')).toBeVisible()
})

test('clicking Open button submits and migrates to active state', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('theme')
	await page.getByRole('button', { name: 'Open' }).click()
	await expect(page.locator('aside.chat-panel')).toBeVisible()
})
