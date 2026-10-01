import { expect, test } from '@playwright/test'

/** The polymetric view (#168) in a real browser: three measures per box, a key, the pickers. */
test.describe('graph polymetric', () => {
	test('draws each file as a box sized and shaded by its own measures', async ({ page }) => {
		await page.goto('/app/graph?variant=polymetric')
		const leaves = page.locator('[data-graph-layout="polymetric"] [data-graph-cluster][data-graph-node-id]')
		await expect(leaves.first()).toBeVisible()
		expect(await leaves.count()).toBe(27)

		const boxes = await leaves.evaluateAll((els) =>
			els.map((el) => {
				const r = el.getBoundingClientRect()
				return { w: Math.round(r.width), h: Math.round(r.height), bg: getComputedStyle(el).backgroundColor }
			})
		)
		// Three independent channels: widths, heights and fills all vary across the files.
		expect(new Set(boxes.map((b) => b.w)).size).toBeGreaterThan(3)
		expect(new Set(boxes.map((b) => b.h)).size).toBeGreaterThan(3)
		expect(new Set(boxes.map((b) => b.bg)).size).toBeGreaterThan(3)
	})

	test('names the measure on each channel in the legend', async ({ page }) => {
		await page.goto('/app/graph?variant=polymetric')
		await expect(page.locator('[data-legend-channel="width"] [data-legend-measure]')).toHaveText(/declarations/i)
		await expect(page.locator('[data-legend-channel="height"] [data-legend-measure]')).toHaveText(/loc/i)
		await expect(page.locator('[data-legend-channel="color"] [data-legend-measure]')).toHaveText(/churn/i)
	})

	test('a picked measure redraws the boxes, and survives selecting one', async ({ page }) => {
		await page.goto('/app/graph?variant=polymetric')
		const leaves = page.locator('[data-graph-layout="polymetric"] [data-graph-cluster][data-graph-node-id]')
		const widths = () => leaves.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)).join(','))
		const before = await widths()

		await page.locator('select[data-graph-measure="width"]').selectOption('churn')
		await expect(page.locator('[data-legend-channel="width"] [data-legend-measure]')).toHaveText(/churn/i)
		await expect.poll(widths).not.toBe(before)
		const picked = await widths()

		await leaves.first().click()
		await expect(leaves.first()).toHaveAttribute('data-node-state', 'selected')
		await expect(page.locator('select[data-graph-measure="width"]')).toHaveValue('churn')
		expect(await widths()).toBe(picked)
	})
})
