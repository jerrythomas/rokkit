import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkPlotParity from './fixtures/SparkPlotParity.svelte'

/**
 * What this covers that the jsdom suite cannot:
 *
 * JSDOM reports 0 for every field of getBoundingClientRect(), so a jsdom test can compare
 * the `d` attribute strings but can never confirm the two panels occupy the same real pixel
 * box — and `d` equality alone doesn't rule out e.g. a viewBox/scale mismatch that happens
 * to produce matching path data but renders it at the wrong size. Here both are real
 * Chromium layout.
 *
 * This is the guard against SparkState's no-op members (`place`, `setHovered`,
 * `handleSelect`, `interactive`) silently changing what a geom produces: a geom never
 * branches on whether it's inside a <Spark> or a <Plot>, so if the two ever render
 * differently, SparkState — not the geom — is what's wrong.
 */
async function nextFrames(n = 2) {
	for (let i = 0; i < n; i++) {
		await new Promise((r) => requestAnimationFrame(r))
	}
}

describe('Spark vs Plot — same <Line> geom renders identically', () => {
	it('both render a line geom with a non-empty path', async () => {
		const { container } = render(SparkPlotParity)
		await nextFrames()

		const sparkPath = container.querySelector('[data-parity-spark] [data-plot-geom="line"] path')
		const plotPath = container.querySelector('[data-parity-plot] [data-plot-geom="line"] path')

		expect(sparkPath).toBeTruthy()
		expect(plotPath).toBeTruthy()
		expect(sparkPath!.getAttribute('d')).toBeTruthy()
		expect(plotPath!.getAttribute('d')).toBeTruthy()
	})

	it('renders identical path data inside Spark and inside Plot', async () => {
		const { container } = render(SparkPlotParity)
		await nextFrames()

		const sparkPath = container.querySelector('[data-parity-spark] [data-plot-geom="line"] path')!
		const plotPath = container.querySelector('[data-parity-plot] [data-plot-geom="line"] path')!

		expect(plotPath.getAttribute('d')).toBe(sparkPath.getAttribute('d'))
	})

	it('occupies the same real pixel box in both containers', async () => {
		const { container } = render(SparkPlotParity)
		await nextFrames()

		const sparkPath = container.querySelector('[data-parity-spark] [data-plot-geom="line"] path')!
		const plotPath = container.querySelector('[data-parity-plot] [data-plot-geom="line"] path')!

		const sparkRect = sparkPath.getBoundingClientRect()
		const plotRect = plotPath.getBoundingClientRect()

		// Real geometry, not JSDOM's stubbed zeros — the premise of this whole suite.
		expect(sparkRect.width).toBeGreaterThan(0)
		expect(sparkRect.height).toBeGreaterThan(0)

		expect(plotRect.top).toBeCloseTo(sparkRect.top, 1)
		expect(plotRect.left).toBeCloseTo(sparkRect.left, 1)
		expect(plotRect.width).toBeCloseTo(sparkRect.width, 1)
		expect(plotRect.height).toBeCloseTo(sparkRect.height, 1)
	})
})
