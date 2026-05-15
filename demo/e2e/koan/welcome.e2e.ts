import { expect, test } from '@playwright/test'

test('welcome state shows enso, tagline, input, and Send button; no sidebar', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByText('○')).toBeVisible()
	await expect(page.getByText('start with a word')).toBeVisible()
	await expect(page.getByRole('textbox')).toBeVisible()
	await expect(page.getByRole('button', { name: 'Send' })).toBeVisible()
	await expect(page.locator('aside.chat-panel')).toHaveCount(0)
})

test('typing a query and pressing Enter migrates to active state', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('tabs')
	await input.press('Enter')
	await expect(page.locator('aside.chat-panel')).toBeVisible()
})

test('clicking Send button submits and migrates to active state', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('theme')
	await page.getByRole('button', { name: 'Send' }).click()
	await expect(page.locator('aside.chat-panel')).toBeVisible()
})

test('submitting "theme" clears input and shows conversation', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('theme')
	await input.press('Enter')
	// Input should be empty after submit
	await expect(page.locator('aside.chat-panel textarea')).toHaveValue('')
	// Conversation should show user message
	await expect(page.locator('.msg.user .body')).toHaveText('theme')
	// Conversation should show koan response
	await expect(page.locator('.msg.response .body')).toContainText('Theme Builder')
})

test('response anchor mounts the demo in canvas', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('theme')
	await input.press('Enter')
	// Click the anchor in the conversation
	const anchor = page.locator('.anchor').first()
	await expect(anchor).toBeVisible()
	await anchor.click()
	// Canvas should now show the active demo
	await expect(page.locator('.back')).toBeVisible()
})

test('suggestion chips hidden when input is empty', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('theme')
	await input.press('Enter')
	// After submit, input is empty, chips should not be visible
	await expect(page.locator('.chip')).toHaveCount(0)
})

test('suggestion chips appear while typing', async ({ page }) => {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('theme')
	await input.press('Enter')
	// Now type something new
	const textarea = page.locator('aside.chat-panel textarea')
	await textarea.fill('tab')
	// Chips should appear now that input has content
	await expect(page.locator('.chip').first()).toBeVisible()
})
