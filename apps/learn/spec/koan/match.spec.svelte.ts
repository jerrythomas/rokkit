import { describe, it, expect } from 'vitest'
import { runMatch } from '../../src/lib/koan/match.svelte'

describe('runMatch', () => {
	it('returns empty array for empty query', () => {
		expect(runMatch('')).toEqual([])
	})

	it('returns top matches for keyword', () => {
		const r = runMatch('theme')
		expect(r[0].id).toBe('theme-wizard')
	})

	it('returns multiple matches when query is broad', () => {
		const r = runMatch('tab')
		expect(r.length).toBeGreaterThan(0)
	})

	it('returns no-match for gibberish', () => {
		const r = runMatch('xyzzyplugh')
		expect(r).toEqual([])
	})
})
