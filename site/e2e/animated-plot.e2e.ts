import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// Default: stackoverflow dataset, animate by date (145 monthly frames), x=pct, y=language, sorted=true (bar chart race)

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

	test('renders scrub slider with correct max (145 frames → max=144)', async ({ page }) => {
		const slider = page.locator('[data-plot-timeline-scrub]')
		await expect(slider).toBeVisible()
		const max = await slider.getAttribute('max')
		expect(Number(max)).toBe(144)
	})

	test('renders frame label showing a date value', async ({ page }) => {
		const label = page.locator('[data-plot-timeline-label]')
		await expect(label).toBeVisible()
		const text = await label.textContent()
		expect(text?.trim()).toMatch(/\d{2}-\d{2}-\d{4}/)
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

	test('sorted=false: bars maintain stable y-positions across frames (no swapping)', async ({
		page
	}) => {
		// Open the controls panel (first toolbar item with aria-pressed)
		await page.locator('[data-toolbar-item][aria-pressed="false"]').first().click()
		// Wait for controls panel to appear
		await page.locator('[data-scope="#/sorted"]').waitFor({ state: 'visible' })

		// Toggle sorted off via data-scope selector (FormRenderer field wrapper)
		await page.locator('[data-scope="#/sorted"] [data-checkbox-icon]').click()

		// Disable tween so frame transitions are instant (no mid-tween noise)
		await page.locator('[data-scope="#/tween"] [data-checkbox-icon]').click()

		// Wait for the chart to re-render
		await page.waitForTimeout(300)

		const bars = page.locator('[data-plot-element="bar"]')
		await expect(bars.first()).toBeVisible()

		// Capture bar y-positions and data-plot-value (language) in frame 0
		const frame0 = await bars.evaluateAll((els) =>
			els.map((el) => ({
				lang: el.getAttribute('data-plot-value'),
				y: el.getAttribute('y')
			}))
		)

		// Scrub to last frame to get maximum difference between frames
		const slider = page.locator('[data-plot-timeline-scrub]')
		await slider.evaluate((el: HTMLInputElement) => {
			el.value = el.max
			el.dispatchEvent(new Event('input'))
		})
		await page.waitForTimeout(300)

		// Capture bar positions in the last frame
		const frameN = await bars.evaluateAll((els) =>
			els.map((el) => ({
				lang: el.getAttribute('data-plot-value'),
				y: el.getAttribute('y')
			}))
		)

		// Build maps keyed by language
		const frame0Map = new Map(frame0.map((b) => [b.lang, b.y]))
		const frameNMap = new Map(frameN.map((b) => [b.lang, b.y]))

		// Every language present in both frames must have the same y-position
		for (const [lang, y0] of frame0Map) {
			const yN = frameNMap.get(lang)
			if (yN !== undefined) {
				expect(Number(yN)).toBeCloseTo(Number(y0), 0)
			}
		}

		// Also verify bars themselves have no NaN
		const widths = await bars.evaluateAll((els) => els.map((el) => el.getAttribute('width')))
		for (const w of widths) {
			expect(w).not.toContain('NaN')
		}
	})
})
