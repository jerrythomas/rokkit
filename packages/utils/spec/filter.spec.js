import { describe, it, expect } from 'vitest'
import { filterOperations } from '../src/filter'

describe('filter', () => {
	it('should return correct results for the equal operator', () => {
		expect(filterOperations['='](10, 10)).toBeTruthy()
		expect(filterOperations['='](10, 5)).toBeFalsy()
	})

	it('should return correct results for the less than operator', () => {
		expect(filterOperations['<'](5, 10)).toBeTruthy()
		expect(filterOperations['<'](10, 5)).toBeFalsy()
	})

	it('should return correct results for the greater than operator', () => {
		expect(filterOperations['>'](10, 5)).toBeTruthy()
		expect(filterOperations['>'](5, 10)).toBeFalsy()
	})

	it('should return correct results for the less than or equal to operator', () => {
		expect(filterOperations['<='](5, 10)).toBeTruthy()
		expect(filterOperations['<='](10, 10)).toBeTruthy()
		expect(filterOperations['<='](10, 5)).toBeFalsy()
	})

	it('should return correct results for the greater than or equal to operator', () => {
		expect(filterOperations['>='](10, 5)).toBeTruthy()
		expect(filterOperations['>='](10, 10)).toBeTruthy()
		expect(filterOperations['>='](5, 10)).toBeFalsy()
	})

	it('should return correct results for the not equal operator', () => {
		expect(filterOperations['!='](10, 5)).toBeTruthy()
		expect(filterOperations['!='](10, 10)).toBeFalsy()
	})

	it('should return correct results for the case-insensitive regex operator', () => {
		expect(filterOperations['~*']('abc', /abc/i)).toBeTruthy()
		expect(filterOperations['~*']('def', /abc/i)).toBeFalsy()
		expect(filterOperations['~*']('AbC', /abc/i)).toBeTruthy()
		expect(filterOperations['~*']('ABC', /abc/i)).toBeTruthy()
	})

	it('should return correct results for the case-sensitive regex operator', () => {
		expect(filterOperations['~']('abc', /abc/)).toBeTruthy()
		expect(filterOperations['~']('def', /abc/)).toBeFalsy()
		expect(filterOperations['~']('ABC', /abc/)).toBeFalsy()
		expect(filterOperations['~']('AbC', /abc/)).toBeFalsy()
	})

	it('should return correct results for the case-sensitive negated regex operator', () => {
		expect(filterOperations['!~']('abc', /abc/)).toBeFalsy()
		expect(filterOperations['!~']('ABC', /abc/)).toBeTruthy()
		expect(filterOperations['!~']('AbC', /abc/)).toBeTruthy()
		expect(filterOperations['!~']('def', /abc/)).toBeTruthy()
		expect(filterOperations['!~']('DEF', /abc/)).toBeTruthy()
	})

	it('should return correct results for the case-insensitive negated regex operator', () => {
		expect(filterOperations['!~*']('abc', /abc/i)).toBeFalsy()
		expect(filterOperations['!~*']('ABC', /abc/i)).toBeFalsy()
		expect(filterOperations['!~*']('AbC', /abc/i)).toBeFalsy()
		expect(filterOperations['!~*']('def', /abc/i)).toBeTruthy()
		expect(filterOperations['!~*']('DEF', /abc/i)).toBeTruthy()
	})
})
