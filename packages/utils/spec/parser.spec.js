import { parseFilters } from '../src/parser'
import { describe, it, expect } from 'vitest'

describe('parse', () => {
	it('should handle a simple string', () => {
		expect(parseFilters('abc')).toEqual([
			{ operator: '~*', value: new RegExp('abc', 'i') }
		])
	})

	it('should handle named filter', () => {
		expect(parseFilters('name:abc')).toEqual([
			{ operator: '~*', value: new RegExp('abc', 'i'), column: 'name' }
		])
	})

	it('should allow operators', () => {
		expect(parseFilters('name:abc')).toEqual([
			{ operator: '~*', value: new RegExp('abc', 'i'), column: 'name' }
		])
		expect(parseFilters('name~*abc')).toEqual([
			{ operator: '~*', value: new RegExp('abc', 'i'), column: 'name' }
		])
		expect(parseFilters('name~abc')).toEqual([
			{ operator: '~', value: new RegExp('abc'), column: 'name' }
		])
		expect(parseFilters('name!~*abc')).toEqual([
			{ operator: '!~*', value: new RegExp('abc', 'i'), column: 'name' }
		])
		expect(parseFilters('name!~abc')).toEqual([
			{ operator: '!~', value: new RegExp('abc'), column: 'name' }
		])
		expect(parseFilters('name=abc')).toEqual([
			{ operator: '=', value: 'abc', column: 'name' }
		])
		expect(parseFilters('name!=abc')).toEqual([
			{ operator: '!=', value: 'abc', column: 'name' }
		])
		expect(parseFilters('age>1')).toEqual([
			{ operator: '>', value: 1, column: 'age' }
		])
		expect(parseFilters('age>=1')).toEqual([
			{ operator: '>=', value: 1, column: 'age' }
		])
		expect(parseFilters('age=>1')).toEqual([
			{ operator: '>=', value: 1, column: 'age' }
		])
		expect(parseFilters('age<10')).toEqual([
			{ operator: '<', value: 10, column: 'age' }
		])
		expect(parseFilters('age<=10')).toEqual([
			{ operator: '<=', value: 10, column: 'age' }
		])
		expect(parseFilters('age=<10')).toEqual([
			{ operator: '<=', value: 10, column: 'age' }
		])
	})

	it('should handle multiple tokens', () => {
		expect(parseFilters('abc age=10')).toEqual([
			{ operator: '~*', value: new RegExp('abc', 'i') },
			{ operator: '=', value: 10, column: 'age' }
		])
		expect(parseFilters('age>=10 gender!=m abc')).toEqual([
			{ operator: '>=', value: 10, column: 'age' },
			{ operator: '!=', value: 'm', column: 'gender' },
			{ operator: '~*', value: new RegExp('abc', 'i') }
		])
	})

	it('should allow space around symbols', () => {
		expect(parseFilters('age =< 10 age => 4')).toEqual([
			{ operator: '<=', value: 10, column: 'age' },
			{ operator: '>=', value: 4, column: 'age' }
		])
	})

	it('should handle quoted strings', () => {
		expect(parseFilters('"rock and"')).toEqual([
			{ operator: '~*', value: /rock and/i }
		])
		expect(parseFilters('name:"rock and"')).toEqual([
			{ operator: '~*', value: /rock and/i, column: 'name' }
		])
		expect(parseFilters('name:"rock and" age=3')).toEqual([
			{ operator: '~*', value: /rock and/i, column: 'name' },
			{ operator: '=', value: 3, column: 'age' }
		])
		expect(parseFilters('"rock and" avatar = "rocky balboa"')).toEqual([
			{ operator: '~*', value: /rock and/i },
			{ operator: '=', value: 'rocky balboa', column: 'avatar' }
		])
	})

	it('should allow symbols when quoted', () => {
		expect(parseFilters('name=?')).toEqual([{ operator: '~*', value: /name/i }])
		expect(parseFilters('name="?"')).toEqual([
			{ operator: '=', value: '?', column: 'name' }
		])
		expect(parseFilters('name="rokk\'it"')).toEqual([
			{ operator: '=', value: "rokk'it", column: 'name' }
		])
		expect(parseFilters('name="rokk"it"')).toEqual([
			{ operator: '=', value: 'rokk', column: 'name' },
			{ operator: '~*', value: /it/i }
		])
	})
})
