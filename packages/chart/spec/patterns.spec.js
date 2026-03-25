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
		const { container } = render(PatternDef, { props: { id: 'pat-unknown', name: 'unknown', size: 10 } })
		// only the background rect should be rendered (no mark elements)
		expect(container.querySelectorAll('line, circle, polygon, path')).toHaveLength(0)
	})
})
