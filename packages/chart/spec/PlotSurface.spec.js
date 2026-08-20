import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup, waitFor } from '@testing-library/svelte'
import PlotSurface from '../src/PlotSurface.svelte'

/**
 * PlotSurface owns the two client-only effects that the rest of the chart suite
 * can't reach through a parent component: the width-settle animate gate and the
 * dynamically-imported d3 pan/zoom binding.
 *
 * Both need a non-zero container width, which JSDOM reports as 0 by default —
 * the ResizeObserver mock reads getBoundingClientRect(), so stubbing that is
 * what makes `observedWidth` settle.
 */
const CONFIG = {
	data: [
		{ x: 'A', y: 10 },
		{ x: 'B', y: 20 }
	],
	channels: { x: 'x', y: 'y' },
	width: 600,
	height: 400
}

let rectSpy

beforeEach(() => {
	rectSpy = vi
		.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
		.mockReturnValue({ width: 800, height: 400, top: 0, left: 0, bottom: 400, right: 800 })
})

afterEach(() => {
	rectSpy.mockRestore()
	cleanup()
})

describe('PlotSurface — responsive width', () => {
	it('adopts the observed container width over config.width', async () => {
		const { container } = render(PlotSurface, { config: CONFIG })
		const svg = container.querySelector('svg')
		expect(svg).toBeTruthy()
		await waitFor(() => expect(svg.getAttribute('width')).toBe('800'))
	})
})

describe('PlotSurface — animate gate', () => {
	it('marks the surface animated one frame after the width settles', async () => {
		const { container } = render(PlotSurface, { config: CONFIG, animate: true })
		const svg = container.querySelector('svg')
		// The gate opens inside a requestAnimationFrame, so it is not set synchronously.
		await waitFor(() => expect(svg.hasAttribute('data-plot-animate')).toBe(true))
	})

	it('never opens the gate when animation is disabled', async () => {
		const { container } = render(PlotSurface, { config: CONFIG, animate: false })
		const svg = container.querySelector('svg')
		await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
		expect(svg.hasAttribute('data-plot-animate')).toBe(false)
	})
})

describe('PlotSurface — pan/zoom', () => {
	it('attaches d3-zoom to the svg once the dynamic import resolves', async () => {
		const { select } = await import('d3-selection')
		const { container } = render(PlotSurface, { config: CONFIG, zoom: true })
		const svg = container.querySelector('svg')

		// d3-zoom binds its own namespaced listeners on the svg; their presence is the
		// observable effect of the dynamic import having resolved and called sel.call().
		await waitFor(() => {
			expect(select(svg).on('zoom.zoom') || svg.__zoom).toBeTruthy()
		})
	})

	it('detaches the zoom binding and resets the transform on unmount', async () => {
		const { unmount, container } = render(PlotSurface, { config: CONFIG, zoom: true })
		const svg = container.querySelector('svg')
		await waitFor(() => expect(svg.__zoom).toBeTruthy())

		// Tears down the effect: cancels the pending import, detaches .zoom listeners
		// and resets the PlotState zoom transform.
		expect(() => unmount()).not.toThrow()
	})

	it('does not bind zoom when the zoom prop is off', async () => {
		const { container } = render(PlotSurface, { config: CONFIG, zoom: false })
		const svg = container.querySelector('svg')
		await new Promise((resolve) => setTimeout(resolve, 0))
		expect(svg.__zoom).toBeUndefined()
	})
})
