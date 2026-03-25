import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Playground defaults: segment-based data, fill=segment, stat=sum, legend=true

test.describe('PieChart', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'pie-chart')
	})

	test('renders an SVG element', async ({ page }) => {
		const svg = page.locator('.preview-area svg').first()
		await expect(svg).toBeVisible()
	})

	test('renders arc path elements (one per segment)', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-plot-element="arc"]')
		await expect(paths.first()).toBeVisible()
		const count = await paths.count()
		// Playground has 5 segments
		expect(count).toBe(5)
	})

	test('arc paths have a non-trivial d attribute (no NaN)', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-plot-element="arc"]')
		const dValues = await paths.evaluateAll((els) => els.map((el) => el.getAttribute('d')))
		for (const d of dValues) {
			expect(d).toBeTruthy()
			expect(d).not.toContain('NaN')
		}
	})

	test('arc paths have fill color (not the fallback #888)', async ({ page }) => {
		const paths = page.locator('.preview-area svg path[data-plot-element="arc"]')
		const fills = await paths.evaluateAll((els) => els.map((el) => el.getAttribute('fill')))
		for (const fill of fills) {
			expect(fill).toBeTruthy()
			expect(fill).not.toBe('#888')
		}
	})

	test('arc paths are centered in the SVG (transform includes translate)', async ({ page }) => {
		const group = page.locator('.preview-area svg g[data-plot-geom="arc"]')
		const transform = await group.getAttribute('transform')
		expect(transform).toMatch(/translate/)
	})

	test('legend is visible by default', async ({ page }) => {
		const legend = page.locator('.preview-area [data-plot-legend]')
		await expect(legend).toBeVisible()
	})
})
