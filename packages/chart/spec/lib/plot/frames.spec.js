import { describe, it, expect } from 'vitest'
import {
	extractFrames,
	completeFrames,
	computeStaticDomains
} from '../../../src/lib/plot/frames.js'

const rawData = [
	{ year: 1999, class: 'compact', hwy: 29 },
	{ year: 1999, class: 'suv', hwy: 20 },
	{ year: 2008, class: 'compact', hwy: 31 }
	// 2008/suv intentionally missing to test completion
]

describe('extractFrames', () => {
	it('returns one entry per distinct time field value', () => {
		const frames = extractFrames(rawData, 'year')
		expect(frames.size).toBe(2)
		expect([...frames.keys()]).toEqual([1999, 2008])
	})

	it('each frame contains rows matching its time value', () => {
		const frames = extractFrames(rawData, 'year')
		expect(frames.get(1999)).toHaveLength(2)
		expect(frames.get(2008)).toHaveLength(1)
	})
})

describe('completeFrames', () => {
	it('fills missing frame values with y=0', () => {
		const result = completeFrames(rawData, { x: 'class', y: 'hwy' }, 'year')

		// 2008/suv was missing — should now appear with hwy=0
		expect(result).toHaveLength(4)
		const suv2008 = result.find((r) => r.class === 'suv' && r.year === 2008)
		expect(suv2008).toBeDefined()
		expect(suv2008.hwy).toBe(0)
	})

	it('leaves existing rows unchanged', () => {
		const result = completeFrames(rawData, { x: 'class', y: 'hwy' }, 'year')
		const compact1999 = result.find((r) => r.class === 'compact' && r.year === 1999)
		expect(compact1999?.hwy).toBe(29)
	})

	it('handles color channel — fills missing (x, color, frame) combos', () => {
		const data = [
			{ year: 1999, class: 'compact', drv: 'f', hwy: 29 },
			{ year: 1999, class: 'compact', drv: '4', hwy: 26 },
			{ year: 2008, class: 'compact', drv: 'f', hwy: 31 }
			// 2008/compact/4 intentionally missing
		]
		const result = completeFrames(data, { x: 'class', y: 'hwy', color: 'drv' }, 'year')
		expect(result).toHaveLength(4)
		const missing = result.find((r) => r.class === 'compact' && r.drv === '4' && r.year === 2008)
		expect(missing).toBeDefined()
		expect(missing.hwy).toBe(0)
	})

	it('returns data unchanged when no group fields', () => {
		const result = completeFrames(rawData, { y: 'hwy' }, 'year')
		expect(result).toBe(rawData)
	})
})

describe('computeStaticDomains', () => {
	it('returns y domain spanning all frames combined', () => {
		const { yDomain } = computeStaticDomains(rawData, { y: 'hwy' })
		expect(yDomain[0]).toBe(0) // includeZero default
		expect(yDomain[1]).toBe(31) // max across all rows
	})

	it('returns categorical x domain covering all frames', () => {
		const { xDomain } = computeStaticDomains(rawData, { x: 'class', y: 'hwy' })
		expect(xDomain).toContain('compact')
		expect(xDomain).toContain('suv')
	})
})
