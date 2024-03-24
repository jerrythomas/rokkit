import { readFileSync } from 'fs'
import { expect, test } from '@playwright/test'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
// const version = '__APP_VERSION__'
test.describe('home', () => {
	test('should render home page', async ({ page }) => {
		await page.goto('/')
		page.waitForSelector('button[type="submit"]')
		const version = await page.locator('header > div > small').textContent()
		expect(version).toBe(pkg.version)
		const logo = page.getByRole('link', { name: 'Rokkit Logo' })
		expect(await logo.getAttribute('href')).toBe('/')
		const start = page.getByRole('button', { name: 'Get Started' })
		await expect(page.locator('main')).toHaveScreenshot('home.png')

		await start.click()
		await page.waitForURL('/tutorial/welcome/introduction')
		expect(page.url()).toBe('http://localhost:4173/tutorial/welcome/introduction')
	})
})
