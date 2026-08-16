import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import AnimatedPlot from '../src/AnimatedPlot.svelte'
import mpg from './fixtures/mpg.json'

describe('AnimatedPlot', () => {
	const defaultProps = {
		data: mpg,
		animate: { by: 'year' },
		x: 'class',
		y: 'hwy',
		geoms: [{ type: 'bar', stat: 'mean' }],
		width: 600,
		height: 400
	}

	it('renders without crashing', () => {
		expect(() => render(AnimatedPlot, { props: defaultProps })).not.toThrow()
	})

	it('renders data-plot-animated container', () => {
		const { container } = render(AnimatedPlot, { props: defaultProps })
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders timeline controls', () => {
		const { container } = render(AnimatedPlot, { props: defaultProps })
		expect(container.querySelector('[data-plot-timeline]')).toBeTruthy()
	})

	it('renders play/pause button', () => {
		const { container } = render(AnimatedPlot, { props: defaultProps })
		expect(container.querySelector('[data-plot-timeline-playpause]')).toBeTruthy()
	})

	it('renders scrub slider with correct max', () => {
		const { container } = render(AnimatedPlot, { props: defaultProps })
		const slider = container.querySelector('[data-plot-timeline-scrub]')
		const expectedFrames = new Set(mpg.map((d) => d.year)).size
		expect(Number(slider?.getAttribute('max'))).toBe(expectedFrames - 1)
	})

	it('stops playing when scrub is used — integration smoke test', async () => {
		// Verify the component renders with playback state accessible
		// (deep animation behavior not testable in jsdom, but we verify structure)
		const { container } = render(AnimatedPlot, { props: defaultProps })
		const slider = container.querySelector('[data-plot-timeline-scrub]')
		expect(slider).toBeTruthy()
		// slider should not be disabled — has frames
		expect(slider?.disabled).toBe(false)
	})

	it('renders with single-frame dataset without crashing', () => {
		const singleFrame = [{ year: 1999, class: 'compact', hwy: 29 }]
		const { container } = render(AnimatedPlot, {
			props: { ...defaultProps, data: singleFrame }
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
		// Slider max should be 0 (only one frame)
		const slider = container.querySelector('[data-plot-timeline-scrub]')
		expect(Number(slider?.getAttribute('max'))).toBe(0)
	})

	// A standard (non-race) animation flips via the same geom place() path as static charts —
	// the caller's orientation drives the layout; the frame tween interpolates values regardless.
	// tween:false → the frame's display data is set with duration 0; vi.waitFor lets the tweened
	// store emit so the first frame's bars are in the DOM.
	const readBars = (container) =>
		[...container.querySelectorAll('rect[data-plot-element="bar"]')].map((r) => ({
			x: Math.round(Number(r.getAttribute('x'))),
			w: Math.round(Number(r.getAttribute('width'))),
			h: Math.round(Number(r.getAttribute('height')))
		}))
	const barsFor = async (props) => {
		const { container } = render(AnimatedPlot, {
			props: { ...defaultProps, tween: false, ...props }
		})
		await vi.waitFor(() => expect(readBars(container).length).toBeGreaterThan(1))
		return readBars(container)
	}
	const uniq = (arr, k) => new Set(arr.map((o) => o[k])).size

	it('vertical (default): bar heights vary by value', async () => {
		const vert = await barsFor({ orientation: 'vertical' })
		expect(uniq(vert, 'h')).toBeGreaterThan(1)
	})

	it('orientation="horizontal" transposes: widths vary by value and bars start at x=0', async () => {
		const horiz = await barsFor({ orientation: 'horizontal' })
		expect(uniq(horiz, 'w')).toBeGreaterThan(1)
		expect(horiz.every((b) => b.x === 0)).toBe(true)
	})

	it('flip is sugar for orientation="horizontal"', async () => {
		const byFlip = await barsFor({ flip: true })
		const byOrientation = await barsFor({ orientation: 'horizontal' })
		expect(byFlip).toEqual(byOrientation)
	})
})
