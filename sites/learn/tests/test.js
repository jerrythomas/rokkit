import { readFileSync } from 'fs'

import { expect, test } from '@playwright/test'
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

test('index page has expected h1', async ({ page }) => {
	await page.goto('/')
	const header = page.locator('header')
	expect(header.locator('div').locator('small').textContent()).toBe(pkg.version)
	// expect(await page.textContent('h1')).toBe('Welcome to SvelteKit')

	// await page.getByRole('button', { name: 'Get Started' }).click()
	// await page.getByLabel('mode-dark').click()
	// await page.getByLabel('mode-dark').click()
	// await page.getByLabel('i-rokkit:arrow-right').click()
})
