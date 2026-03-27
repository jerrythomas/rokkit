import { describe, it, expect } from 'vitest'
import { PieBrewer } from '../../src/lib/brewing/PieBrewer.svelte.js'

const data = [
	{ segment: 'A', share: 10 },
	{ segment: 'A', share: 20 },
	{ segment: 'B', share: 30 }
]

describe('PieBrewer.transform', () => {
	it('always aggregates by label field', () => {
		const brewer = new PieBrewer()
		const result = brewer.transform(data, { label: 'segment', y: 'share' }, 'sum')
		expect(result).toHaveLength(2)
		expect(result.find((r) => r.segment === 'A').share).toBe(30)
	})

	it('uses sum when stat is identity (identity not valid for pie)', () => {
		const brewer = new PieBrewer()
		const result = brewer.transform(data, { label: 'segment', y: 'share' }, 'identity')
		expect(result).toHaveLength(2) // still aggregates
	})

	it('applies count stat', () => {
		const brewer = new PieBrewer()
		const result = brewer.transform(data, { label: 'segment', y: 'share' }, 'count')
		expect(result.find((r) => r.segment === 'A').share).toBe(2)
	})

	it('returns data unchanged when label or y is missing', () => {
		const brewer = new PieBrewer()
		expect(brewer.transform(data, { y: 'share' }, 'sum')).toBe(data)
		expect(brewer.transform(data, { label: 'segment' }, 'sum')).toBe(data)
	})
})
