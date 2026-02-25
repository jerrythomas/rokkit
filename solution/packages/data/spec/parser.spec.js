import { describe, it, expect } from 'vitest'
import { parseFilters, getRegex } from '../src/parser'

describe('parser', () => {
	describe('getRegex', () => {
		it('should match the expected regex', () => {
			const expected =
				/(?<group>((?<column>[\w]+)\s?(?<operator>:|>|<|>=|<=|=<|=>|=|!=|~|~\*|!~|!~\*)\s?)(?<value>("[^"]+"|[^\s=:<>!~*]+)))/gm
			expect(getRegex()).toEqual(expected)
		})
	})

	describe('parseFilters', () => {
		it('should handle a simple string', () => {
			expect(parseFilters('abc')).toEqual([{ operator: '~*', value: /abc/i }])
		})

		it('should handle named filter', () => {
			expect(parseFilters('name:abc')).toEqual([{ operator: '~*', value: /abc/i, column: 'name' }])
		})

		it('should allow operators', () => {
			expect(parseFilters('name:abc')).toEqual([{ operator: '~*', value: /abc/i, column: 'name' }])
			expect(parseFilters('name~*abc')).toEqual([{ operator: '~*', value: /abc/i, column: 'name' }])
			expect(parseFilters('name~abc')).toEqual([{ operator: '~', value: /abc/, column: 'name' }])
			expect(parseFilters('name!~*abc')).toEqual([
				{ operator: '!~*', value: /abc/i, column: 'name' }
			])
			expect(parseFilters('name!~abc')).toEqual([{ operator: '!~', value: /abc/, column: 'name' }])
			expect(parseFilters('name=abc')).toEqual([{ operator: '=', value: 'abc', column: 'name' }])
			expect(parseFilters('name!=abc')).toEqual([{ operator: '!=', value: 'abc', column: 'name' }])
			expect(parseFilters('age>1')).toEqual([{ operator: '>', value: 1, column: 'age' }])
			expect(parseFilters('age>=1')).toEqual([{ operator: '>=', value: 1, column: 'age' }])
			expect(parseFilters('age=>1')).toEqual([{ operator: '>=', value: 1, column: 'age' }])
			expect(parseFilters('_age<10')).toEqual([{ operator: '<', value: 10, column: '_age' }])
			expect(parseFilters('age_a<=10')).toEqual([{ operator: '<=', value: 10, column: 'age_a' }])
			expect(parseFilters('age=<10')).toEqual([{ operator: '<=', value: 10, column: 'age' }])
		})

		it('should handle multiple tokens', () => {
			expect(parseFilters('abc age=10')).toEqual([
				{ operator: '=', value: 10, column: 'age' },
				{ operator: '~*', value: /abc/i }
			])
			expect(parseFilters('age>=10 gender!=m abc')).toEqual([
				{ operator: '>=', value: 10, column: 'age' },
				{ operator: '!=', value: 'm', column: 'gender' },
				{ operator: '~*', value: /abc/i }
			])
		})

		it('should allow space around symbols', () => {
			expect(parseFilters('age =< 10 age => 4')).toEqual([
				{ operator: '<=', value: 10, column: 'age' },
				{ operator: '>=', value: 4, column: 'age' }
			])
		})

		it('should handle quoted strings', () => {
			expect(parseFilters('"rock and"')).toEqual([{ operator: '~*', value: /rock and/i }])
			expect(parseFilters('name:"rock and"')).toEqual([
				{ operator: '~*', value: /rock and/i, column: 'name' }
			])
			expect(parseFilters('name:"rock and" age=3')).toEqual([
				{ operator: '~*', value: /rock and/i, column: 'name' },
				{ operator: '=', value: 3, column: 'age' }
			])
			expect(parseFilters('"rock and" avatar = "rocky balboa"')).toEqual([
				{ operator: '=', value: 'rocky balboa', column: 'avatar' },
				{ operator: '~*', value: /rock and/i }
			])
		})

		it('should allow symbols when quoted', () => {
			expect(parseFilters('name=?')).toEqual([{ column: 'name', operator: '=', value: '?' }])
			expect(parseFilters('name="?"')).toEqual([{ operator: '=', value: '?', column: 'name' }])
			expect(parseFilters('name="rokk\'it"')).toEqual([
				{ operator: '=', value: "rokk'it", column: 'name' }
			])
			expect(parseFilters('name="rokk"it"')).toEqual([
				{ operator: '=', value: 'rokk', column: 'name' },
				{ operator: '~*', value: /it"/i }
			])
		})
	})
})
