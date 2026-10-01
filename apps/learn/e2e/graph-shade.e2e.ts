import { expect, test } from '@playwright/test'

/** The shade channel (#164) in a real browser: boxes painted by a share, the picker, the key. */
test.describe('graph shade', () => {
	const shaded = '[data-graph-layout="world"] [data-graph-cluster][data-graph-shaded]'

	test('paints the packages from the ramp — a real spread of shades, labelled for each', async ({ page }) => {
		await page.goto('/app/graph?variant=treemap-tested')
		await expect(page.locator(shaded).first()).toBeVisible()
		const fills = await page.locator(shaded).evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor))
		expect(new Set(fills).size).toBeGreaterThan(3)
		await expect(page.locator('[data-legend-shade="tested"]')).toContainText('tested')
	})

	test('“none” turns shading off, a measure turns it back on — and it survives a selection', async ({ page }) => {
		await page.goto('/app/graph?variant=treemap-tested')
		const picker = page.locator('select[data-graph-measure="color"]')
		await expect(page.locator(shaded).first()).toBeVisible()
		await picker.selectOption('')
		await expect(page.locator(shaded)).toHaveCount(0)
		await picker.selectOption('tested')
		await expect(page.locator(shaded).first()).toBeVisible()
		const leaf = page.locator('[data-graph-layout="world"] [data-graph-cluster][data-graph-node-id]').first()
		await leaf.click()
		await expect(leaf).toHaveAttribute('data-node-state', 'selected')
		await expect(picker).toHaveValue('tested')
		await expect(page.locator(shaded).first()).toBeVisible()
	})
})
