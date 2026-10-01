import { expect, test } from '@playwright/test'

/**
 * Import cycles (#166) in a real browser, over rokkit's own component imports: each cycle is a
 * collapsed group node; expanding shows the cycle and its weakest edge; collapsing restores.
 */
test.describe('graph cycles', () => {
	test('a cycle is one collapsed node that expands to its members and folds back', async ({ page }) => {
		await page.goto('/app/graph?variant=cycles')
		const group = page.locator('[data-graph-node][data-graph-collapsed]').first()
		await expect(group).toBeVisible()
		const count = Number(await group.locator('[data-graph-node-count]').textContent())
		expect(count).toBeGreaterThan(1)
		const id = await group.getAttribute('data-graph-node')

		await group.locator('[data-graph-group-toggle]').click()
		await expect(page.locator(`[data-graph-node="${id}"]`)).toHaveCount(0)
		await expect(page.locator(`[data-graph-member-of="${id}"]`)).toHaveCount(count)
		await expect(page.locator('[data-graph-edge][data-edge-weakest]').first()).toBeAttached()

		await page.locator(`[data-graph-member-of="${id}"]`).first().click()
		await page.locator('[data-graph-group-action="collapse"]').click()
		await expect(page.locator(`[data-graph-node="${id}"]`)).toBeVisible()
		await expect(page.locator(`[data-graph-member-of="${id}"]`)).toHaveCount(0)
	})

	test('the weakest edge is stroked differently from the rest', async ({ page }) => {
		await page.goto('/app/graph?variant=cycles')
		await page.locator('[data-graph-group-toggle]').first().click()
		const weakest = page.locator('[data-graph-edge][data-edge-weakest] path').first()
		const ordinary = page.locator('[data-graph-edge]:not([data-edge-weakest]) path').first()
		const [w, o] = await Promise.all([
			weakest.evaluate((el) => [getComputedStyle(el).stroke, getComputedStyle(el).strokeDasharray]),
			ordinary.evaluate((el) => [getComputedStyle(el).stroke, getComputedStyle(el).strokeDasharray])
		])
		expect(w).not.toEqual(o)
		expect(w[1]).not.toBe('none')
	})
})
