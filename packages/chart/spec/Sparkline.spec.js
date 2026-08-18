import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Sparkline from '../src/Sparkline.svelte'

describe('Sparkline', () => {
	it('renders an SVG element', () => {
		const { container } = render(Sparkline, { data: [10, 20, 30, 15] })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('uses provided width and height', () => {
		const { container } = render(Sparkline, { data: [10, 20, 30], width: 120, height: 32 })
		const svg = container.querySelector('svg')
		expect(svg?.getAttribute('width')).toBe('120')
		expect(svg?.getAttribute('height')).toBe('32')
	})

	it('renders a path for line type', () => {
		const { container } = render(Sparkline, { data: [10, 20, 30], type: 'line' })
		expect(container.querySelector('path')).toBeTruthy()
	})

	it('renders rects for bar type', () => {
		const { container } = render(Sparkline, { data: [10, 20, 30], type: 'bar' })
		expect(container.querySelectorAll('rect').length).toBeGreaterThan(0)
	})

	it('renders a smooth line path without NaN when curve=smooth', () => {
		const { container } = render(Sparkline, {
			data: [10, 20, 15, 30],
			type: 'line',
			curve: 'smooth'
		})
		const path = container.querySelector('path')
		expect(path?.getAttribute('d')).toBeTruthy()
		expect(path?.getAttribute('d')).not.toContain('NaN')
	})

	it('renders a smooth area path without NaN when curve=smooth', () => {
		const { container } = render(Sparkline, {
			data: [10, 20, 15, 30],
			type: 'area',
			curve: 'smooth'
		})
		const paths = container.querySelectorAll('path')
		for (const p of paths) {
			expect(p.getAttribute('d')).not.toContain('NaN')
		}
	})

	it('accepts objects with field prop', () => {
		const data = [{ v: 10 }, { v: 20 }, { v: 30 }]
		const { container } = render(Sparkline, { data, field: 'v' })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders pattern defs when pattern prop is set', () => {
		const { container } = render(Sparkline, {
			data: [10, 20, 30],
			type: 'area',
			pattern: 'diagonal'
		})
		expect(container.querySelector('defs pattern')).toBeTruthy()
	})

	it('uses pattern fill on area when pattern is set', () => {
		const { container } = render(Sparkline, {
			data: [10, 20, 30],
			type: 'area',
			pattern: 'dots'
		})
		const areaPath = container.querySelector('path[fill^="url("]')
		expect(areaPath).toBeTruthy()
	})

	it('renders pattern overlay rects for bar type', () => {
		const { container } = render(Sparkline, {
			data: [10, 20, 30],
			type: 'bar',
			pattern: 'hatch'
		})
		const patternRects = container.querySelectorAll('rect[fill^="url("]')
		expect(patternRects.length).toBe(3)
	})

	it('re-anchors bars at an explicit baseline (negative bars hang down)', () => {
		// values [5,-5], height 40, domain [-5,5] → yScale(0)=20, yScale(5)=0, yScale(-5)=40
		const { container } = render(Sparkline, {
			data: [5, -5],
			type: 'bar',
			width: 100,
			height: 40,
			baseline: 0
		})
		const rects = container.querySelectorAll('rect')
		expect(rects.length).toBe(2)
		// positive bar grows UP from the zero line: top at 0, height 20
		expect(rects[0].getAttribute('y')).toBe('0')
		expect(rects[0].getAttribute('height')).toBe('20')
		// negative bar hangs DOWN from the zero line: top at 20, height 20
		expect(rects[1].getAttribute('y')).toBe('20')
		expect(rects[1].getAttribute('height')).toBe('20')
	})

	it('auto-defaults baseline to 0 for bars with negative values', () => {
		const { container } = render(Sparkline, {
			data: [5, -5],
			type: 'bar',
			width: 100,
			height: 40
		})
		const rects = container.querySelectorAll('rect')
		// same anchoring as explicit baseline={0}: negative bar hangs from the zero line
		expect(rects[1].getAttribute('y')).toBe('20')
		expect(rects[1].getAttribute('height')).toBe('20')
	})

	it('draws a baseline reference line when a baseline is in effect', () => {
		const { container } = render(Sparkline, {
			data: [5, -5],
			type: 'bar',
			width: 100,
			height: 40,
			baseline: 0
		})
		const line = container.querySelector('[data-plot-baseline]')
		expect(line).toBeTruthy()
		expect(line?.getAttribute('y1')).toBe('20')
		expect(line?.getAttribute('y2')).toBe('20')
	})

	it('keeps all-positive bars min-anchored with no baseline (regression)', () => {
		// domain [10,30] range [40,0] → yScale(10)=40 → shortest bar has height 0
		const { container } = render(Sparkline, {
			data: [10, 20, 30],
			type: 'bar',
			width: 100,
			height: 40
		})
		const rects = container.querySelectorAll('rect')
		expect(rects.length).toBe(3)
		expect(rects[0].getAttribute('height')).toBe('0')
		// no baseline line drawn when baseline is not in effect
		expect(container.querySelector('[data-plot-baseline]')).toBeNull()
	})

	it('extends the domain to include an explicit baseline (all-positive bars)', () => {
		// data [10,20,30] with baseline 0 → domain becomes [0,30] (not [10,30]),
		// so the shortest bar is no longer collapsed to height 0, and a baseline line is drawn.
		const { container } = render(Sparkline, {
			data: [10, 20, 30],
			type: 'bar',
			width: 100,
			height: 40,
			baseline: 0
		})
		const rects = container.querySelectorAll('rect')
		expect(rects[0].getAttribute('height')).not.toBe('0')
		expect(container.querySelector('[data-plot-baseline]')).toBeTruthy()
	})

	it('draws a baseline reference line for line type without changing the fill', () => {
		const { container } = render(Sparkline, {
			data: [10, 20, 30],
			type: 'line',
			width: 100,
			height: 40,
			baseline: 15
		})
		// reference rule renders for non-bar types
		expect(container.querySelector('[data-plot-baseline]')).toBeTruthy()
		// the line path is still present (fill/line rendering unaffected)
		expect(container.querySelector('path')).toBeTruthy()
	})
})
