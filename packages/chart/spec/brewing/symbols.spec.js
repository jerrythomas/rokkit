import { describe, it, expect } from 'vitest'
import { assignSymbols, SYMBOL_ORDER } from '../../src/lib/brewing/symbols.js'

describe('assignSymbols', () => {
	it('returns a Map', () => {
		const result = assignSymbols(['A', 'B'])
		expect(result).toBeInstanceOf(Map)
	})

	it('maps each value to a symbol from SYMBOL_ORDER', () => {
		const values = ['x', 'y', 'z']
		const result = assignSymbols(values)
		expect(result.get('x')).toBe(SYMBOL_ORDER[0])
		expect(result.get('y')).toBe(SYMBOL_ORDER[1])
		expect(result.get('z')).toBe(SYMBOL_ORDER[2])
	})

	it('cycles through SYMBOL_ORDER when more values than symbols', () => {
		const values = Array.from({ length: SYMBOL_ORDER.length + 2 }, (_, i) => `v${i}`)
		const result = assignSymbols(values)
		expect(result.get('v0')).toBe(SYMBOL_ORDER[0])
		expect(result.get(`v${SYMBOL_ORDER.length}`)).toBe(SYMBOL_ORDER[0])
	})

	it('returns empty Map for empty input', () => {
		const result = assignSymbols([])
		expect(result.size).toBe(0)
	})

	it('handles single value', () => {
		const result = assignSymbols(['only'])
		expect(result.size).toBe(1)
		expect(result.get('only')).toBe('circle')
	})
})

describe('SYMBOL_ORDER', () => {
	it('is an array of strings', () => {
		expect(Array.isArray(SYMBOL_ORDER)).toBe(true)
		for (const sym of SYMBOL_ORDER) {
			expect(typeof sym).toBe('string')
		}
	})

	it('starts with circle', () => {
		expect(SYMBOL_ORDER[0]).toBe('circle')
	})
})
