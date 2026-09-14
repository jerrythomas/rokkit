import { describe, it, expect } from 'vitest'
import { PATTERNS, PatternDef } from '../src/patterns/index.js'
import { render } from '@testing-library/svelte'

describe('PATTERNS', () => {
	it('exports a PATTERNS data object', () => {
		expect(typeof PATTERNS).toBe('object')
		expect(Object.keys(PATTERNS).length).toBeGreaterThan(0)
	})

	it('does not contain zigzag', () => {
		expect(PATTERNS).not.toHaveProperty('zigzag')
	})

	it('does not contain hexagons', () => {
		expect(PATTERNS).not.toHaveProperty('hexagons')
	})

	it('contains petals', () => {
		expect(PATTERNS).toHaveProperty('petals')
	})
})

describe('PatternDef', () => {
	it('renders without error for each pattern key', () => {
		for (const name of Object.keys(PATTERNS)) {
			const { container } = render(PatternDef, { props: { id: `pat-${name}`, name, size: 10 } })
			expect(container).toBeTruthy()
		}
	})

	it('renders empty pattern for an unknown pattern name', () => {
		const { container } = render(PatternDef, {
			props: { id: 'pat-unknown', name: 'unknown', size: 10 }
		})
		// only the background rect should be rendered (no mark elements)
		expect(container.querySelectorAll('line, circle, polygon, path')).toHaveLength(0)
	})
})

describe('PatternDef — mark types', () => {
	/** Render one mark and return the `<pattern>` element. */
	const patternFor = (marks) =>
		render(PatternDef, { props: { id: 'p', marks, size: 10 } }).container.querySelector('pattern')

	it('renders a line mark', () => {
		const p = patternFor([{ type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }])

		expect(p.querySelector('line')).toBeTruthy()
	})

	it('renders a circle mark', () => {
		const p = patternFor([{ type: 'circle', cx: 0.5, cy: 0.5, r: 0.25 }])

		const circle = p.querySelector('circle')
		expect(circle).toBeTruthy()
		// Unit coordinates are scaled by `size`, so 0.5 of a 10px tile is 5.
		expect(circle.getAttribute('cx')).toBe('5')
		expect(circle.getAttribute('r')).toBe('2.5')
	})

	it('renders a rect mark', () => {
		const p = patternFor([{ type: 'rect', x: 0, y: 0, w: 0.5, h: 0.5 }])

		expect(p.querySelector('rect[width]')).toBeTruthy()
	})

	it('renders a polygon mark', () => {
		const p = patternFor([
			{
				type: 'polygon',
				points: [
					[0, 0],
					[1, 0],
					[0.5, 1]
				]
			}
		])

		expect(p.querySelector('polygon')).toBeTruthy()
		expect(p.querySelector('polygon').getAttribute('points')).toBeTruthy()
	})

	it('renders a path mark', () => {
		const p = patternFor([{ type: 'path', d: [['M', 0, 0], ['L', 1, 1]] }])

		expect(p.querySelector('path')).toBeTruthy()
		expect(p.querySelector('path').getAttribute('d')).toBeTruthy()
	})

	it('ignores an unrecognised mark type', () => {
		// A pattern authored against a newer mark vocabulary must degrade to
		// "draw nothing" rather than break the whole <defs> block.
		const p = patternFor([{ type: 'wormhole', x: 0, y: 0 }])

		expect(p).toBeTruthy()
		// Only the backing <rect fill="none"> the component always emits.
		expect(p.querySelectorAll('line, circle, polygon, path')).toHaveLength(0)
	})

	it('renders every mark of a real PATTERNS entry', () => {
		const p = patternFor(PATTERNS.brick)

		expect(p.querySelectorAll('line').length).toBe(PATTERNS.brick.length)
	})
})
