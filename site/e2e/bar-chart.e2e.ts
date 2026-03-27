import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground defaults: x=class (7 categories), y=hwy, fill=drv (3 values), stat=mean
// Selects in controls panel (after opening): [class, hwy, drv, None, mean]
//   indices:                                   0=x    1=y   2=fill 3=pattern 4=stat
// Checkboxes in controls panel: 0=stack, 1=grid, 2=legend

async function openControls(page: any) {
	await page.locator('[data-toolbar-item][title="Toggle Properties"]').click()
	await page.waitForTimeout(200)
}

test.describe('BarChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'bar-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders grouped bars for class × drv', async ({ page }) => {
		const bars = page.locator('.preview-area svg rect[data-plot-element="bar"]')
		const count = await bars.count()
		// 7 classes × up to 3 drv values → at least 7
		expect(count).toBeGreaterThanOrEqual(7)
	})

	test('renders X and Y axes', async ({ page }) => {
		await expect(page.locator('.preview-area [data-plot-axis="x"]')).toBeVisible()
		await expect(page.locator('.preview-area [data-plot-axis="y"]')).toBeVisible()
	})

	test('renders grid lines when grid is enabled', async ({ page }) => {
		const count = await page.locator('.preview-area [data-plot-grid-line]').count()
		expect(count).toBeGreaterThan(0)
	})

	test('bars have solid fill colors (no pattern by default)', async ({ page }) => {
		const bars = page.locator('.preview-area svg rect[data-plot-element="bar"]')
		const firstFill = await bars.first().getAttribute('fill')
		expect(firstFill).not.toMatch(/^url\(/)
		expect(firstFill).toBeTruthy()
	})

	test('bars use pattern fill when pattern field is set', async ({ page }) => {
		await openControls(page)
		// pattern is the 4th select (index 3)
		const selects = page.locator('[data-select]')
		await selects.nth(3).locator('[data-select-trigger]').click()
		await page.locator('[data-select-option]').filter({ hasText: 'drv' }).first().click()
		await page.waitForTimeout(400)

		const bars = page.locator('.preview-area svg rect[data-plot-element="bar"]')
		const firstFill = await bars.first().getAttribute('fill')
		expect(firstFill).toMatch(/^url\(#chart-pat-/)
	})

	test('SVG defs contains pattern elements when pattern is active', async ({ page }) => {
		await openControls(page)
		const selects = page.locator('[data-select]')
		await selects.nth(3).locator('[data-select-trigger]').click()
		await page.locator('[data-select-option]').filter({ hasText: 'drv' }).first().click()
		await page.waitForTimeout(400)

		const patterns = page.locator('.preview-area svg [data-plot-pattern-defs] pattern')
		const count = await patterns.count()
		expect(count).toBeGreaterThan(0)
	})

	test('stacked bars stay within y-axis domain', async ({ page }) => {
		await openControls(page)
		// stack toggle: click the label to enable stacking
		await page.locator('label[for="\\#/stack"]').click()
		await page.waitForTimeout(300)

		const bars = page.locator('.preview-area svg rect[data-plot-element="bar"]')
		const count = await bars.count()
		expect(count).toBeGreaterThan(0)

		// All bars must have non-negative y and height, and y+h must fit inside SVG height
		const svgHeight = Number(await page.locator('.preview-area svg').first().getAttribute('height'))
		const barData = await bars.evaluateAll((els) =>
			els.map((el) => ({
				y: Number(el.getAttribute('y')),
				h: Number(el.getAttribute('height'))
			}))
		)
		for (const { y, h } of barData) {
			expect(y).toBeGreaterThanOrEqual(0)
			expect(h).toBeGreaterThanOrEqual(0)
			expect(y + h).toBeLessThanOrEqual(svgHeight + 1) // +1 for float rounding
		}
	})

	test('legend visible by default (playground default legend=true)', async ({ page }) => {
		const legend = page.locator('.preview-area [data-plot-legend]')
		await expect(legend).toBeVisible()
	})

	test('legend hidden when legend toggle is off', async ({ page }) => {
		await openControls(page)
		// legend label click toggles it off (default is on)
		await page.locator('label[for="\\#/legend"]').click()
		await page.waitForTimeout(200)

		const legend = page.locator('.preview-area [data-plot-legend]')
		await expect(legend).toHaveCount(0)
	})
})
