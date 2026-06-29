import { describe, it, expect } from 'vitest'
import { spreadValuesAsPatterns } from '../../src/lib/grid'

describe('spreadValuesAsPatterns', () => {
	it('returns an empty object for empty values array', () => {
		expect(spreadValuesAsPatterns([], ['solid'], ['red'])).toEqual({})
	})

	it('maps each value to a pattern/color pair', () => {
		const result = spreadValuesAsPatterns([1, 2], ['dots', 'lines'], ['#f00', '#0f0'])
		expect(result[1]).toEqual({ id: 'dots_#f00', pattern: 'dots', color: '#f00' })
		expect(result[2]).toEqual({ id: 'lines_#0f0', pattern: 'lines', color: '#0f0' })
	})

	it('wraps patterns when values exceed pattern count', () => {
		const result = spreadValuesAsPatterns([10, 20, 30], ['solid'], ['red', 'blue', 'green'])
		expect(result[10].pattern).toBe('solid')
		expect(result[20].pattern).toBe('solid')
		expect(result[30].pattern).toBe('solid')
	})

	it('wraps colors when values exceed color count', () => {
		const result = spreadValuesAsPatterns([10, 20, 30], ['solid', 'dots', 'lines'], ['red'])
		expect(result[10].color).toBe('red')
		expect(result[20].color).toBe('red')
		expect(result[30].color).toBe('red')
	})

	it('generates correct id as pattern_color', () => {
		const result = spreadValuesAsPatterns(['a', 'b'], ['circle', 'square'], ['#111', '#222'])
		expect(result['a'].id).toBe('circle_#111')
		expect(result['b'].id).toBe('square_#222')
	})

	it('uses the value as the key in the result object', () => {
		const values = [42, 'hello']
		const result = spreadValuesAsPatterns(values, ['p'], ['c'])
		expect(result).toHaveProperty('42')
		expect(result).toHaveProperty('hello')
	})

	it('color wraps correctly using modulo', () => {
		const result = spreadValuesAsPatterns([1, 2, 3], ['p'], ['red', 'blue'])
		expect(result[1].color).toBe('red')
		expect(result[2].color).toBe('blue')
		expect(result[3].color).toBe('red') // wraps back
	})
})
