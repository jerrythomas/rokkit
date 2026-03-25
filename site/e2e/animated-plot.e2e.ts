import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Default: animate by year (2 frames: 1999, 2008), x=class, y=hwy, stat=mean
// Shows a bar chart that transitions between 1999 and 2008 highway MPG by vehicle class.

test.describe('AnimatedPlot playground', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'animated-plot')
	})

	test('renders the animated plot container', async ({ page }) => {
		await expect(page.locator('[data-plot-animated]')).toBeVisible()
	})

	test('renders timeline controls', async ({ page }) => {
		await expect(page.locator('[data-plot-timeline]')).toBeVisible()
	})

	test('renders play/pause button', async ({ page }) => {
		const btn = page.locator('[data-plot-timeline-playpause]')
		await expect(btn).toBeVisible()
	})

	test('renders scrub slider with correct max (year has 2 frames → max=1)', async ({ page }) => {
		const slider = page.locator('[data-plot-timeline-scrub]')
		await expect(slider).toBeVisible()
		const max = await slider.getAttribute('max')
		expect(Number(max)).toBe(1)
	})

	test('renders frame label showing a year value', async ({ page }) => {
		const label = page.locator('[data-plot-timeline-label]')
		await expect(label).toBeVisible()
		const text = await label.textContent()
		expect(['1999', '2008']).toContain(text?.trim())
	})

	test('renders bar chart with bars in the first frame', async ({ page }) => {
		const bars = page.locator('[data-plot-element="bar"]')
		await expect(bars.first()).toBeVisible()
		const count = await bars.count()
		expect(count).toBeGreaterThan(0)
	})

	test('bars have no NaN in their geometry', async ({ page }) => {
		const bars = page.locator('[data-plot-element="bar"]')
		const xValues = await bars.evaluateAll((els) => els.map((el) => el.getAttribute('x')))
		for (const x of xValues) {
			expect(x).not.toContain('NaN')
		}
	})

	test('renders speed selector', async ({ page }) => {
		await expect(page.locator('[data-plot-timeline-speed]')).toBeVisible()
	})
})
