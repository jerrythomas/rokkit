import { test, expect } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * Theme wizard step 03 — heading levels (#152). The wizard edits `[data-heading]` rules; a
 * real browser proves the edit reaches a `data-heading` element (step 04's Type tile), and
 * that it survives a reload once saved.
 */
async function openTypography(page: import('@playwright/test').Page) {
	await gotoHydrated(page, '/app/theming')
	await page.getByRole('tab', { name: /Typography/ }).click()
	await expect(page.locator('[data-wizard-heading="1"]')).toBeVisible()
}

const previewType = async (page: import('@playwright/test').Page, level: string) => {
	await page.getByRole('tab', { name: /Preview/ }).click()
	const el = page.locator(`[data-preview-heading="${level}"]`)
	await expect(el).toBeVisible()
	const type = await el.evaluate((node) => {
		const cs = getComputedStyle(node)
		return { size: cs.fontSize, weight: cs.fontWeight }
	})
	await page.getByRole('tab', { name: /Typography/ }).click()
	return type
}

test('step 03 offers size and weight for each heading level, starting at the defaults', async ({ page }) => {
	await openTypography(page)
	for (const [level, size] of [['1', '28'], ['2', '18'], ['3', '14.5'], ['4', '14']]) {
		await expect(page.locator(`[data-wizard-heading="${level}"] [data-heading-size]`)).toHaveText(`${size}px`)
	}
	expect(await previewType(page, '2')).toEqual({ size: '18px', weight: '600' })
})

test('a size step and a weight pick reach the preview’s heading at once', async ({ page }) => {
	await openTypography(page)
	const row = page.locator('[data-wizard-heading="2"]')
	await row.getByRole('button', { name: /Larger/ }).click()
	await row.getByRole('button', { name: /Larger/ }).click()
	await row.getByRole('button', { name: '700' }).click()
	expect(await previewType(page, '2')).toEqual({ size: '19px', weight: '700' })
})

test('the levels survive a reload once the preset is saved', async ({ page }) => {
	await openTypography(page)
	await page.locator('[data-wizard-heading="1"]').getByRole('button', { name: /Smaller/ }).click()
	await page.getByRole('button', { name: /Save preset/i }).click()
	await page.reload()
	await page.getByRole('tab', { name: /Typography/ }).click()
	await expect(page.locator('[data-wizard-heading="1"] [data-heading-size]')).toHaveText('27.5px')
})
