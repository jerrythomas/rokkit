import { expect, test } from '@playwright/test'

test('about page should have title', async ({ page }) => {
	await page.goto('/')
	expect(await page.title()).toBe('About')
})

test('should send magic link', async ({ page }) => {
	const email = 'jerry.thomas@senecaglobal.com'
	const magic = '//input[@id="magic"]'
	await page.goto('/auth')

	await page.locator(magic).click()
	await page.locator(magic).fill(email)
	let value = await page.locator(magic).inputValue()
	expect(value).toBe(email)
	await page.keyboard.press('Enter')
	console.log(page.url())
})
