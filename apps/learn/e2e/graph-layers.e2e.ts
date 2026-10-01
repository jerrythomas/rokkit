import { expect, test } from '@playwright/test'

/** Layers (#167) in a real browser: bands, the climbing edge in the danger colour, the filter. */
test.describe('graph layers', () => {
	test('the sample draws five labelled layers, with the one climbing edge distinct', async ({ page }) => {
		await page.goto('/app/graph?variant=layers-sample')
		await expect(page.locator('[data-graph-layout="layers"] [data-graph-cluster]')).toHaveCount(5)
		const up = page.locator('[data-graph-edge][data-edge-conformance="up"] path')
		const down = page.locator('[data-graph-edge][data-edge-conformance="down"] path').first()
		await expect(up).toHaveCount(1)
		const [u, d] = await Promise.all([
			up.evaluate((el) => getComputedStyle(el).stroke),
			down.evaluate((el) => getComputedStyle(el).stroke)
		])
		expect(u).not.toBe(d)
	})

	test('“Violations only” leaves just the edge that climbs, and back', async ({ page }) => {
		await page.goto('/app/graph?variant=layers-sample')
		await expect(page.locator('[data-graph-edge]')).toHaveCount(5)
		await page.locator('[data-graph-violations]').click()
		await expect(page.locator('[data-graph-edge]')).toHaveCount(1)
		await expect(page.locator('[data-graph-edge]')).toHaveAttribute('data-edge-conformance', 'up')
		await page.locator('[data-graph-violations]').click()
		await expect(page.locator('[data-graph-edge]')).toHaveCount(5)
	})

	test('rokkit’s own components keep their layers — no import climbs', async ({ page }) => {
		await page.goto('/app/graph?variant=layers')
		await expect(page.locator('[data-graph-layout="layers"] [data-graph-cluster]')).toHaveCount(6)
		await expect(page.locator('[data-graph-edge][data-edge-conformance="up"]')).toHaveCount(0)
		expect(await page.locator('[data-graph-edge]').count()).toBeGreaterThan(0)
	})
})
