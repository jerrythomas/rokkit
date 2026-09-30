import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestRule from '../helpers/TestRule.svelte'
import { scaleLinear } from 'd3-scale'
import { createMockState } from '../helpers/mock-plot-state.js'

// mock state: xScale = band [a,b,c] over [0,300]; yScale = linear [0,100] over [200,0]
describe('Rule.svelte', () => {
	it('renders a horizontal rule at a y value, spanning the x range', () => {
		const { container } = render(TestRule, { props: { state: createMockState(), y: 50 } })
		const line = container.querySelector('[data-plot-element="rule"]')
		expect(line).toBeTruthy()
		// yScale(50) = 100; horizontal → y1 === y2 === 100, and x1 !== x2 (spans the axis)
		expect(Number(line.getAttribute('y1'))).toBeCloseTo(100, 1)
		expect(Number(line.getAttribute('y2'))).toBeCloseTo(100, 1)
		expect(line.getAttribute('x1')).not.toBe(line.getAttribute('x2'))
	})

	it('renders one line per value for an array', () => {
		const { container } = render(TestRule, { props: { state: createMockState(), y: [20, 40, 60] } })
		expect(container.querySelectorAll('[data-plot-element="rule"]').length).toBe(3)
	})

	it('renders a vertical rule at a band category (band centre)', () => {
		const { container } = render(TestRule, { props: { state: createMockState(), x: 'b' } })
		const line = container.querySelector('[data-plot-element="rule"]')
		// vertical → x1 === x2, y1 !== y2
		expect(line.getAttribute('x1')).toBe(line.getAttribute('x2'))
		expect(Number(line.getAttribute('y1'))).not.toBe(Number(line.getAttribute('y2')))
	})

	it('transposes under flip: a y-value rule becomes vertical', () => {
		const flipped = createMockState({ isFlipped: true, place: (u, v) => ({ x: v, y: u }) })
		const { container } = render(TestRule, { props: { state: flipped, y: 50 } })
		const line = container.querySelector('[data-plot-element="rule"]')
		expect(Number(line.getAttribute('x1'))).toBeCloseTo(Number(line.getAttribute('x2')), 3)
	})

	it('renders a label at the line end when provided', () => {
		const { container } = render(TestRule, { props: { state: createMockState(), y: 50, label: 'target' } })
		expect(container.querySelector('[data-plot-element="rule-label"]')?.textContent).toBe('target')
	})

	it('renders nothing without x or y', () => {
		const { container } = render(TestRule, { props: { state: createMockState() } })
		expect(container.querySelector('[data-plot-geom="rule"]')).toBeNull()
	})

	describe('slope + intercept (abline)', () => {
		// Unit plane: x [0,1] over [0,300], y [0,1] over [200,0] — the main-sequence frame.
		const unit = () =>
			createMockState({
				xScale: scaleLinear().domain([0, 1]).range([0, 300]),
				yScale: scaleLinear().domain([0, 1]).range([200, 0])
			})
		const ends = (line) => ['x1', 'y1', 'x2', 'y2'].map((a) => Number(line.getAttribute(a)))

		it('draws y = slope·x + intercept across the plot', () => {
			const { container } = render(TestRule, { props: { state: unit(), slope: -1, intercept: 1 } })
			const line = container.querySelector('[data-plot-element="rule"]')
			const [x1, y1, x2, y2] = ends(line)
			// (0,1) → (0,0) on screen; (1,0) → (300,200)
			expect(x1).toBeCloseTo(0, 3)
			expect(y1).toBeCloseTo(0, 3)
			expect(x2).toBeCloseTo(300, 3)
			expect(y2).toBeCloseTo(200, 3)
			expect(line.getAttribute('data-plot-rule')).toBe('slope')
		})

		it('clips to the visible domain instead of leaving the plot', () => {
			// y = 2x leaves the top edge at x = 0.5
			const { container } = render(TestRule, { props: { state: unit(), slope: 2, intercept: 0 } })
			const [x1, y1, x2, y2] = ends(container.querySelector('[data-plot-element="rule"]'))
			expect(x1).toBeCloseTo(0, 3)
			expect(y1).toBeCloseTo(200, 3)
			expect(x2).toBeCloseTo(150, 3)
			expect(y2).toBeCloseTo(0, 3)
		})

		it('draws nothing when the line misses the domain entirely', () => {
			const { container } = render(TestRule, { props: { state: unit(), slope: 0, intercept: 5 } })
			expect(container.querySelector('[data-plot-element="rule"]')).toBeNull()
		})

		it('defaults intercept to 0', () => {
			const { container } = render(TestRule, { props: { state: unit(), slope: 1 } })
			const [x1, y1, x2, y2] = ends(container.querySelector('[data-plot-element="rule"]'))
			expect([x1, y1, x2, y2].map((v) => Math.round(v))).toEqual([0, 200, 300, 0])
		})

		it('is ignored on a band x axis, where a slope has no meaning', () => {
			const { container } = render(TestRule, { props: { state: createMockState(), slope: 1 } })
			expect(container.querySelector('[data-plot-element="rule"]')).toBeNull()
		})

		it('coexists with x/y rules and labels the sloped line', () => {
			const { container } = render(TestRule, {
				props: { state: unit(), y: 0.5, slope: -1, intercept: 1, label: 'main sequence' }
			})
			expect(container.querySelectorAll('[data-plot-element="rule"]').length).toBe(2)
			expect(container.querySelectorAll('[data-plot-element="rule-label"]').length).toBe(2)
		})
	})
})
