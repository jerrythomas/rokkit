import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Plot from '../src/Plot.svelte'
import mpg from './fixtures/mpg.json'

// Minimal render test — confirms Plot creates SVG and sets context
describe('Plot.svelte', () => {
	it('renders an SVG element', () => {
		const { container } = render(Plot, {
			props: { data: mpg.slice(0, 5), width: 400, height: 300, grid: false, legend: false }
		})
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders with data-plot-root attribute', () => {
		const { container } = render(Plot, {
			props: { data: mpg.slice(0, 5), width: 400, height: 300 }
		})
		expect(container.querySelector('[data-plot-root]')).toBeTruthy()
	})

	it('renders canvas transform group', () => {
		const { container } = render(Plot, {
			props: { data: mpg.slice(0, 5), width: 400, height: 300 }
		})
		expect(container.querySelector('[data-plot-canvas]')).toBeTruthy()
	})

	it('accepts spec prop without crashing', () => {
		const spec = {
			data: mpg.slice(0, 5),
			x: 'class',
			y: 'hwy',
			geoms: [{ type: 'bar', stat: 'identity' }]
		}
		expect(() => render(Plot, { props: { spec, width: 400, height: 300 } })).not.toThrow()
	})

	// Regression: top-level `spec.stack` must reach the Bar geom's `options.stack`
	// so a stacked bar chart from an AI response (fenced ```plot``` block) actually
	// stacks instead of rendering identical to the grouped variant.
	// See apps/learn/src/lib/chat-demo/router.ts (`chart-grouped` route).
	it('forwards spec.stack to spec-driven bar geoms so stacked/grouped diverge', async () => {
		const data = [
			{ q: 'Q1', p: 'H', v: 20 },
			{ q: 'Q1', p: 'S', v: 30 },
			{ q: 'Q2', p: 'H', v: 25 },
			{ q: 'Q2', p: 'S', v: 15 }
		]
		const baseSpec = {
			data,
			x: 'q',
			y: 'v',
			fill: 'p',
			geoms: [{ type: 'bar' }]
		}
		const grouped = render(Plot, {
			props: { spec: { ...baseSpec, stack: false }, width: 400, height: 300, grid: false }
		})
		const stacked = render(Plot, {
			props: { spec: { ...baseSpec, stack: true }, width: 400, height: 300, grid: false }
		})
		await tick()

		// The stacked and grouped variants must produce visibly different bar
		// layouts — same rows, same x/y, same fill, only `stack` differs.
		const groupedBars = grouped.container.querySelectorAll('[data-plot-canvas] rect')
		const stackedBars = stacked.container.querySelectorAll('[data-plot-canvas] rect')
		expect(groupedBars.length).toBeGreaterThan(0)
		expect(stackedBars.length).toBeGreaterThan(0)

		// Grouped: bars in the same x-band are placed side by side (each takes
		// half the band width). Stacked: bars in the same x-band overlap
		// horizontally (share the same x + width). Serialise the (x,width)
		// tuples per SVG so the layouts must differ.
		const shape = (nodes) =>
			[...nodes]
				.map((n) => `${n.getAttribute('x')}:${n.getAttribute('width')}`)
				.sort()
				.join('|')
		expect(shape(groupedBars)).not.toBe(shape(stackedBars))
	})

	describe('responsive width', () => {
		const OriginalRO = global.ResizeObserver

		afterEach(() => {
			global.ResizeObserver = OriginalRO
		})

		it('updates SVG width when ResizeObserver fires with a new container size', async () => {
			let resizeCallback
			class CapturingRO extends OriginalRO {
				constructor(cb) {
					super(cb)
					resizeCallback = cb
				}
			}
			global.ResizeObserver = CapturingRO

			const { container } = render(Plot, {
				props: { data: mpg.slice(0, 5), width: 400, height: 300, grid: false }
			})

			const root = container.querySelector('[data-plot-root]')
			resizeCallback([{ target: root, contentRect: { width: 320, height: 0, top: 0, left: 0, right: 320, bottom: 0 } }])
			await tick()

			expect(Number(container.querySelector('svg').getAttribute('width'))).toBe(320)
		})

		it('falls back to width prop when container reports zero width', () => {
			const { container } = render(Plot, {
				props: { data: mpg.slice(0, 5), width: 400, height: 300, grid: false }
			})
			// JSDOM's getBoundingClientRect returns 0 — effectiveWidth falls back to prop
			expect(Number(container.querySelector('svg').getAttribute('width'))).toBe(400)
		})
	})
})
