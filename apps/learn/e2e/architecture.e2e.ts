import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { gotoHydrated } from './helpers'
import architecture from '../src/lib/koan/demos/chart/architecture.json' with { type: 'json' }

/**
 * The architecture-analysis primitives, in a real browser: what a unit test cannot see is
 * whether the geoms paint, whether the demo's zone tints actually out-specify the geom's own
 * rule, and whether a theme styles overlay edges and matrix cells at all.
 *
 * Expected counts come from the committed dataset, not from literals — regenerating the
 * metrics must not break the suite.
 */

const openChart = async (page: Page, type: string) => {
	await gotoHydrated(page, '/app/chart')
	await page.locator('.composer-tweak-toggle').click()
	await page.locator(`[data-chart-type="${type}"]`).click()
	await expect(page.locator(`[data-chart-type="${type}"]`)).toHaveAttribute('data-active', 'true')
}

const hiddenCoupling = architecture.cochange.filter((e) => !e.imported).length

test.describe('chart primitives', () => {
	test('Region shades both bands, labelled, behind the points', async ({ page }) => {
		await openChart(page, 'region')
		await expect(
			page.locator('[data-plot-region="efficient"] [data-plot-element="region"]')
		).toBeAttached()
		await expect(
			page.locator('[data-plot-region="large"] [data-plot-element="region-label"]')
		).toHaveText('Large engines')
		// Painted behind: the region group precedes the point geom in document order.
		const order = await page.evaluate(() => {
			const region = document.querySelector('[data-plot-geom="region"]')
			const point = document.querySelector('[data-plot-geom="point"]')
			return region && point
				? region.compareDocumentPosition(point) & Node.DOCUMENT_POSITION_FOLLOWING
				: 0
		})
		expect(order).toBeTruthy()
	})

	test('Hull outlines each class and labels it', async ({ page }) => {
		await openChart(page, 'hull')
		expect(await page.locator('[data-plot-element="hull"]').count()).toBeGreaterThan(3)
		await expect(page.locator('[data-plot-element="hull-label"]').first()).toBeAttached()
	})

	test('Contour draws rings, and filled bands on request', async ({ page }) => {
		await openChart(page, 'contour')
		await expect(page.locator('[data-plot-contour-mode="lines"]')).toBeAttached()
		expect(await page.locator('[data-plot-element="contour"]').count()).toBeGreaterThan(2)
		await page
			.locator('[data-chart-controls] label.row.check', { hasText: 'Filled bands' })
			.locator('input')
			.click()
		await expect(page.locator('[data-plot-contour-mode="filled"]')).toBeAttached()
	})
})

test.describe('architecture recipes', () => {
	test('main sequence: zones, the sloped line, hulls and one point per component', async ({
		page
	}) => {
		await openChart(page, 'main-sequence')
		await expect(
			page.locator('[data-plot-region="pain"] [data-plot-element="region-label"]')
		).toHaveText('Zone of pain')
		await expect(page.locator('[data-plot-region="uselessness"]')).toBeAttached()
		await expect(page.locator('[data-plot-rule="slope"]')).toBeAttached()
		// Hulls are opt-in: 18 packages' outlines stacked over the zones hide them.
		await expect(page.locator('[data-plot-element="hull"]')).toHaveCount(0)
		await page
			.locator('[data-chart-controls] label.row.check', { hasText: 'Outline each package' })
			.locator('input')
			.click()
		expect(await page.locator('[data-plot-element="hull"]').count()).toBeGreaterThan(0)
		await expect(page.locator('[data-plot-geom="point"] [data-plot-element="point"]')).toHaveCount(
			architecture.components.length
		)
		await expect(page.locator('[data-architecture-axes]')).toContainText('Instability')
	})

	test('main sequence: the zone tint really lands — the demo rule out-specifies the geom', async ({
		page
	}) => {
		await openChart(page, 'main-sequence')
		const pain = page.locator('[data-plot-region="pain"] [data-plot-element="region"]')
		const useless = page.locator('[data-plot-region="uselessness"] [data-plot-element="region"]')
		const fillOf = (l: typeof pain) => l.evaluate((el) => getComputedStyle(el).fill)
		// Distinct tints, neither left at the geom's currentColor default.
		const [p, u, text] = await Promise.all([
			fillOf(pain),
			fillOf(useless),
			page
				.locator('[data-plot-root]')
				.first()
				.evaluate((el) => getComputedStyle(el).color)
		])
		expect(p).not.toBe(u)
		expect(p).not.toBe(text)
		expect(await pain.evaluate((el) => getComputedStyle(el).fillOpacity)).toBe('0.1')
	})

	test('main sequence: density contours on request', async ({ page }) => {
		await openChart(page, 'main-sequence')
		await expect(page.locator('[data-plot-geom="contour"]')).toHaveCount(0)
		await page
			.locator('[data-chart-controls] label.row.check', { hasText: 'Density contours' })
			.locator('input')
			.click()
		expect(await page.locator('[data-plot-element="contour"]').count()).toBeGreaterThan(0)
	})

	test('a point grows and shrinks IN PLACE on hover — it never jumps toward the corner', async ({
		page
	}) => {
		// Reported as "the point flashes from a nearby location". The hover scale's
		// transform-box lived only on :hover, so on leave it snapped to the SVG origin while the
		// scale eased back — an 87px jump for a point near the bottom-right. Sample every frame
		// of the leave and require the centre to stay put.
		await openChart(page, 'main-sequence')
		const target = await page.evaluate(() => {
			const pts = [...document.querySelectorAll('circle[data-plot-element="point"]')]
			let best = { x: 0, y: 0, i: -1, d: -1 }
			pts.forEach((el, i) => {
				const r = el.getBoundingClientRect()
				const x = r.x + r.width / 2
				const y = r.y + r.height / 2
				const d = Number(el.getAttribute('cx')) + Number(el.getAttribute('cy'))
				if (document.elementFromPoint(x, y) === el && d > best.d) best = { x, y, i, d }
			})
			return best
		})
		expect(target.i).toBeGreaterThanOrEqual(0)
		await page.mouse.move(target.x, target.y)
		await page.waitForTimeout(300)
		await page.evaluate((i) => {
			const el = document.querySelectorAll('circle[data-plot-element="point"]')[i]
			const w = window as unknown as { __drift: number }
			w.__drift = 0
			const r0 = el.getBoundingClientRect()
			const x0 = r0.x + r0.width / 2
			const y0 = r0.y + r0.height / 2
			const t0 = performance.now()
			const tick = () => {
				const r = el.getBoundingClientRect()
				w.__drift = Math.max(w.__drift, Math.hypot(r.x + r.width / 2 - x0, r.y + r.height / 2 - y0))
				if (performance.now() - t0 < 400) requestAnimationFrame(tick)
			}
			requestAnimationFrame(tick)
		}, target.i)
		await page.mouse.move(2, 2)
		await page.waitForTimeout(450)
		const drift = await page.evaluate(() => (window as unknown as { __drift: number }).__drift)
		expect(drift).toBeLessThan(2)
	})

	for (const [type, region] of [
		['hotspots', 'hotspot'],
		['coverage', 'risk'],
		['coupling', 'hub'],
		['smells', 'god']
	] as const) {
		test(`${type}: shades its threshold region over the modules`, async ({ page }) => {
			await openChart(page, type)
			await expect(
				page.locator(`[data-plot-region="${region}"] [data-plot-element="region"]`)
			).toBeAttached()
			expect(await page.locator('[data-plot-element="point"]').count()).toBeGreaterThan(50)
		})
	}
})

test.describe('graph architecture views', () => {
	test('the dependency matrix: a row per component, groups on the diagonal, danger above it', async ({
		page
	}) => {
		await gotoHydrated(page, '/app/graph?variant=matrix')
		await expect(page.locator('[data-graph-matrix]')).toBeVisible()
		await expect(page.locator('[data-matrix-row]')).toHaveCount(architecture.components.length)
		expect(await page.locator('[data-matrix-block]').count()).toBeGreaterThan(1)

		// rokkit has dependencies against the grain today (chart and forms), so this is asserted
		// outright — a guard that skipped when none existed could never fail.
		expect(await page.locator('[data-matrix-cell][data-matrix-above]').count()).toBeGreaterThan(0)
		const [a, b] = await Promise.all([
			page
				.locator('[data-matrix-cell][data-matrix-above] rect')
				.first()
				.evaluate((el) => getComputedStyle(el).fill),
			page
				.locator('[data-matrix-cell]:not([data-matrix-above]) rect')
				.first()
				.evaluate((el) => getComputedStyle(el).fill)
		])
		expect(a).not.toBe(b)
	})

	test('the dependency matrix: a row click selects and lights its row and column', async ({
		page
	}) => {
		await gotoHydrated(page, '/app/graph?variant=matrix')
		const row = page.locator('[data-matrix-row]').nth(2)
		await row.click()
		await expect(row).toHaveAttribute('data-matrix-state', 'selected')
		await row.press('Enter')
		await expect(row).not.toHaveAttribute('data-matrix-state', 'selected')
	})

	test('hidden coupling: co-change edges are overlays, dotted by the theme', async ({ page }) => {
		await gotoHydrated(page, '/app/graph?variant=coupling')
		const overlays = page.locator('[data-graph-edge][data-edge-overlay]')
		await expect(overlays).toHaveCount(hiddenCoupling)
		const dash = await overlays
			.first()
			.locator('path')
			.evaluate((el) => getComputedStyle(el).strokeDasharray)
		expect(dash).not.toBe('none')
	})
})
