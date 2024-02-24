import { expect, test } from '@playwright/test'

test.describe('introduction', () => {
	test('should render introduction', async ({ page }) => {
		await page.goto('/tutorial/welcome/introduction')
		await page.waitForSelector('segment.col-2')
		const tree = page.locator('main > aside tree')
		expect(await tree.isVisible()).toBe(true)
		const node = page.locator('main > aside tree node[aria-selected="true"]')
		console.log(await node.allInnerTexts())
		expect(await node.allInnerTexts()).toContainEqual('Introduction')
		await expect(page.locator('main')).toHaveScreenshot('intro.png')
	})
})
