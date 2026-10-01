import { expect, test } from '@playwright/test'

/** The dual arc diagram (#169) in a real browser: two sides, the hidden pairs, the filter. */
test.describe('graph arcs', () => {
	test('#169’s sample: imports left, shared commits right, the hidden pair distinct', async ({ page }) => {
		await page.goto('/app/graph?variant=arcs-sample')
		await expect(page.locator('[data-graph-layout="arcs"] [data-graph-cluster][data-graph-node-id]')).toHaveCount(4)
		await expect(page.locator('[data-graph-edge][data-edge-side="below"]')).toHaveCount(2)
		await expect(page.locator('[data-graph-edge][data-edge-side="above"]')).toHaveCount(3)
		const hidden = page.locator('[data-graph-edge][data-edge-hidden] path')
		const plain = page.locator('[data-graph-edge][data-edge-side="above"]:not([data-edge-hidden]) path').first()
		await expect(hidden).toHaveCount(1)
		const [h, p] = await Promise.all([
			hidden.evaluate((el) => getComputedStyle(el).stroke),
			plain.evaluate((el) => getComputedStyle(el).stroke)
		])
		expect(h).not.toBe(p)
	})

	test('the arcs bend away from the axis on their own side', async ({ page }) => {
		await page.goto('/app/graph?variant=arcs-sample')
		await page.locator('[data-graph-node-id="file:resolve"]').waitFor()
		// One read, so the box and the arcs are measured at the same fit.
		const g = await page.evaluate(() => {
			const box = document.querySelector('[data-graph-node-id="file:resolve"]')!.getBoundingClientRect()
			const rect = (sel: string) => document.querySelector(sel)!.getBoundingClientRect()
			const left = rect('[data-graph-edge][data-edge-side="below"] path')
			const right = rect('[data-graph-edge][data-edge-side="above"] path')
			return { boxLeft: box.left, boxRight: box.right, leftEnd: left.right, rightStart: right.left }
		})
		expect(g.leftEnd).toBeLessThanOrEqual(g.boxLeft + 1)
		expect(g.rightStart).toBeGreaterThanOrEqual(g.boxRight - 1)
	})

	test('rokkit’s components: “Hidden only” leaves the hidden pairs, and survives a selection', async ({ page }) => {
		await page.goto('/app/graph?variant=arcs')
		const items = page.locator('[data-graph-layout="arcs"] [data-graph-cluster][data-graph-node-id]')
		await expect(items.first()).toBeVisible()
		expect(await items.count()).toBeGreaterThan(40)
		const hiddenCount = await page.locator('[data-graph-edge][data-edge-hidden]').count()
		expect(hiddenCount).toBeGreaterThan(0)
		expect(await page.locator('[data-graph-edge]').count()).toBeGreaterThan(hiddenCount)

		await page.locator('[data-graph-hidden-only]').click()
		await expect(page.locator('[data-graph-edge]')).toHaveCount(hiddenCount)
		await expect(page.locator('[data-graph-edge]:not([data-edge-hidden])')).toHaveCount(0)

		await items.first().click()
		await expect(items.first()).toHaveAttribute('data-node-state', 'selected')
		await expect(page.locator('[data-graph-hidden-only]')).toHaveAttribute('aria-pressed', 'true')
		await expect(page.locator('[data-graph-edge]')).toHaveCount(hiddenCount)
	})

	test('names both sides and the hidden stroke in the legend', async ({ page }) => {
		await page.goto('/app/graph?variant=arcs')
		await expect(page.locator('[data-legend-side="below"]')).toContainText('Imports')
		await expect(page.locator('[data-legend-side="above"]')).toContainText('Shared commits')
		await expect(page.locator('[data-legend-hidden]')).toContainText('Hidden coupling')
	})
})
