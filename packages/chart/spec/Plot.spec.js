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
