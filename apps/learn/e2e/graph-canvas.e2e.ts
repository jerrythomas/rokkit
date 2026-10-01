import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * The canvas's scroll extent and zoom anchoring (#171), in a real browser — the defect was the
 * browser's own layout (a transform does not change scroll size), so jsdom cannot see it.
 * Checked on every layout the demo routes through `Graph`.
 */
const PAD = 28
const MARKS = '[data-graph-world] [data-graph-node], [data-graph-world] [data-graph-cluster], [data-graph-world] [data-graph-wedge]'
const LAYOUTS = [
	['flow', 'er-diagram'],
	['neighborhood', 'neighbourhood'],
	['radial', 'call-graph'],
	['layers', 'layers'],
	['world', 'treemap']
] as const

async function open(page: Page, variant: string) {
	await page.goto(`/app/graph?variant=${variant}`)
	await page.locator(MARKS).first().waitFor()
	// Let the fit settle: the viewport is measured after the first paint.
	await page.waitForTimeout(300)
}

const paper = (page: Page) => page.locator('[data-graph-paper]')

async function zoomIn(page: Page, times: number) {
	for (let i = 0; i < times; i++) {
		await page.locator('[data-graph-zoom="in"]').click()
		await page.waitForTimeout(80)
	}
}

type Mark = { index: number; x: number; y: number; d: number }

/** The mark whose centre is nearest the given viewport point, and its centre. */
function nearest(page: Page, at: { x: number; y: number }): Promise<Mark | null> {
	return page.evaluate(
		({ marks, at }) => {
			let best: Mark | null = null
			const all = [...document.querySelectorAll(marks)]
			for (let index = 0; index < all.length; index++) {
				const r = all[index].getBoundingClientRect()
				if (r.width === 0 && r.height === 0) continue
				const x = r.left + r.width / 2
				const y = r.top + r.height / 2
				const d = Math.hypot(x - at.x, y - at.y)
				if (best === null || d < best.d) best = { index, x, y, d }
			}
			return best
		},
		{ marks: MARKS, at }
	)
}

function markCentre(page: Page, index: number) {
	return page.evaluate(
		({ marks, index }) => {
			const r = document.querySelectorAll(marks)[index].getBoundingClientRect()
			return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }
		},
		{ marks: MARKS, index }
	)
}

for (const [layout, variant] of LAYOUTS) {
	test.describe(`canvas — ${layout}`, () => {
		test('at fit, nothing scrolls', async ({ page }) => {
			await open(page, variant)
			const s = await paper(page).evaluate((el) => [el.scrollWidth, el.clientWidth, el.scrollHeight, el.clientHeight])
			expect(s[0]).toBe(s[1])
			expect(s[2]).toBe(s[3])
		})

		test('zoomed in, scrolling fully right and down brings the last marks in with the padding to spare', async ({ page }) => {
			await open(page, variant)
			await zoomIn(page, 3)
			const edges = await paper(page).evaluate((el, marks) => {
				el.scrollLeft = el.scrollWidth
				el.scrollTop = el.scrollHeight
				const box = el.getBoundingClientRect()
				let right = -Infinity
				let bottom = -Infinity
				el.querySelectorAll(marks).forEach((m) => {
					const r = m.getBoundingClientRect()
					right = Math.max(right, r.right)
					bottom = Math.max(bottom, r.bottom)
				})
				return { right, bottom, paperRight: box.left + el.clientWidth, paperBottom: box.top + el.clientHeight }
			}, MARKS)
			expect(edges.right).toBeLessThanOrEqual(edges.paperRight - PAD + 1)
			expect(edges.bottom).toBeLessThanOrEqual(edges.paperBottom - PAD + 1)
		})

		test('the + button keeps what is at the viewport centre at the centre', async ({ page }) => {
			await open(page, variant)
			await zoomIn(page, 2)
			const centre = await paper(page).evaluate((el) => {
				el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
				el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
				const box = el.getBoundingClientRect()
				return { x: box.left + el.clientWidth / 2, y: box.top + el.clientHeight / 2 }
			})
			const before = await nearest(page, centre)
			expect(before).not.toBeNull()
			const offset = { x: before!.x - centre.x, y: before!.y - centre.y }
			await zoomIn(page, 1)
			const after = await markCentre(page, before!.index)
			// The mark keeps its place relative to the centre, scaled by one zoom step.
			const step = 1.25
			expect(Math.abs(after.x - (centre.x + offset.x * step))).toBeLessThanOrEqual(Math.max(4, after.w))
			expect(Math.abs(after.y - (centre.y + offset.y * step))).toBeLessThanOrEqual(Math.max(4, after.w))
		})

		test('past fit, a pinch keeps the content under the pointer under the pointer', async ({ page }) => {
			await open(page, variant)
			// Past fit on BOTH axes: while the drawing is narrower than the viewport it stays
			// centred on that axis (#171's other rule), which a pointer anchor cannot override.
			for (let i = 0; i < 8; i++) {
				const fits = await paper(page).evaluate((el) => el.scrollWidth <= el.clientWidth || el.scrollHeight <= el.clientHeight)
				if (!fits) break
				await zoomIn(page, 1)
			}
			const box = await paper(page).boundingBox()
			const at = { x: box!.x + box!.width / 3, y: box!.y + box!.height / 2 }
			// The CONTENT coordinate under the pointer, from the world's rect and its real scale —
			// a mark's own box is no reference here, since a dot's label comes and goes with the
			// detail tier as the scale crosses it.
			const under = () =>
				page.evaluate((at) => {
					const world = document.querySelector('[data-graph-world]') as HTMLElement
					const r = world.getBoundingClientRect()
					const scale = new DOMMatrix(getComputedStyle(world).transform).a
					return { x: (at.x - r.left) / scale, y: (at.y - r.top) / scale, scale }
				}, at)
			const before = await under()
			await paper(page).evaluate(
				(el, at) =>
					el.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -100, clientX: at.x, clientY: at.y })),
				at
			)
			await page.waitForTimeout(150)
			const after = await under()
			expect(after.scale).toBeGreaterThan(before.scale)
			// Within a few screen pixels, expressed in content units.
			expect(Math.abs(after.x - before.x) * after.scale).toBeLessThanOrEqual(4)
			expect(Math.abs(after.y - before.y) * after.scale).toBeLessThanOrEqual(4)
		})
	})
}
