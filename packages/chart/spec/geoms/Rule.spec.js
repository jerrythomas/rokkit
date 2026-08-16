import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestRule from '../helpers/TestRule.svelte'
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
})
