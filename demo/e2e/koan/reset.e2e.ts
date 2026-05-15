import { expect, test } from '@playwright/test'

async function openKoan(page: any) {
	await page.goto('/')
	const input = page.getByRole('textbox')
	await input.fill('tabs')
	await input.press('Enter')
	await expect(page.locator('aside.chat-panel')).toBeVisible()
}

test('first reset shows inline confirmation card', async ({ page }) => {
	// Clear localStorage so reset acknowledgement flag is absent
	await page.goto('/')
	await page.evaluate(() => localStorage.clear())

	await openKoan(page)

	// Click the reset button — no acknowledgement yet, should show inline prompt
	await page.locator('button.reset').click()

	// Inline confirmation should appear in the conversation list
	await expect(page.locator('.msg.system')).toBeVisible()
	await expect(page.locator('.msg.system .body')).toContainText('Reset everything')
	await expect(page.getByRole('button', { name: 'Yes, reset' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
})

test('cancel reset dismisses the inline confirmation', async ({ page }) => {
	await page.goto('/')
	await page.evaluate(() => localStorage.clear())

	await openKoan(page)

	await page.locator('button.reset').click()
	await expect(page.locator('.msg.system')).toBeVisible()

	await page.getByRole('button', { name: 'Cancel' }).click()

	await expect(page.locator('.msg.system')).toHaveCount(0)
})

test('confirming reset clears storage and reloads; subsequent reset skips prompt', async ({
	page
}) => {
	await page.goto('/')
	await page.evaluate(() => localStorage.clear())

	await openKoan(page)

	// First reset: confirm via inline prompt
	await page.locator('button.reset').click()
	await expect(page.locator('.msg.system')).toBeVisible()
	await page.getByRole('button', { name: 'Yes, reset' }).click()

	// Page reloads — ends up back on welcome screen (messages cleared)
	await expect(page.getByText('start with a word')).toBeVisible({ timeout: 8000 })

	// Acknowledgement flag should be in localStorage after reload
	const acked = await page.evaluate(() => localStorage.getItem('koan.reset.acknowledged'))
	expect(acked).toBe('true')

	// Navigate back to active state
	await openKoan(page)

	// Second reset: should skip the inline prompt and reload immediately (no .msg.system)
	// We listen for the navigation instead of checking the DOM (page reloads)
	const navigationPromise = page.waitForURL('/', { timeout: 8000 })
	await page.locator('button.reset').click()
	await navigationPromise

	// Ends up on welcome screen again without ever showing the inline card
	await expect(page.getByText('start with a word')).toBeVisible({ timeout: 8000 })
})
