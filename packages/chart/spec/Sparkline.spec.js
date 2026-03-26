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
})
