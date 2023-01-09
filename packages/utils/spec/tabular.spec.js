import { describe, it, expect } from 'vitest'
import { filterObjectArray, filterData } from '../src/tabular'

describe('filter', () => {
	const data = [
		{ name: 'Alice', age: 30, city: 'New York' },
		{ name: 'Bob', age: 25, city: 'San Francisco' },
		{ name: 'Charlie', age: 35, city: 'New York' },
		{ name: 'Dave', age: 40, city: 'Chicago' }
	]

	it('should return all rows when no options are provided', () => {
		const options = {}
		const result = filterObjectArray(data, options)
		expect(result).toEqual(data)
	})

	it('should return all rows that match the value for the specified column', () => {
		const options = { column: 'name', value: 'Alice', operator: '=' }
		const result = filterObjectArray(data, options)
		expect(result).toEqual([{ name: 'Alice', age: 30, city: 'New York' }])
	})

	it('should return all rows that do not match the value for the specified column', () => {
		const options = { column: 'name', value: 'Alice', operator: '!=' }
		const result = filterObjectArray(data, options)
		expect(result).toEqual([
			{ name: 'Bob', age: 25, city: 'San Francisco' },
			{ name: 'Charlie', age: 35, city: 'New York' },
			{ name: 'Dave', age: 40, city: 'Chicago' }
		])
	})

	it('should return all rows that contain the value in any column', () => {
		const options = { value: /New York/i, operator: '~*' }
		const result = filterObjectArray(data, options)
		expect(result).toEqual([
			{ name: 'Alice', age: 30, city: 'New York' },
			{ name: 'Charlie', age: 35, city: 'New York' }
		])
	})

	it('should return all rows that do not contain the value in any column', () => {
		const options = { value: /New York/i, operator: '!~*' }
		const result = filterObjectArray(data, options)
		expect(result).toEqual([
			{ name: 'Bob', age: 25, city: 'San Francisco' },
			{ name: 'Dave', age: 40, city: 'Chicago' }
		])
	})

	it('should return all rows when no filters are provided', () => {
		const filters = []
		const result = filterData(data, filters)
		expect(result).toEqual(data)
	})

	it('should return all rows that match the first filter', () => {
		const filters = [{ column: 'name', value: 'Alice', operator: '=' }]
		const result = filterData(data, filters)
		expect(result).toEqual([{ name: 'Alice', age: 30, city: 'New York' }])
	})

	it('should return all rows that match both filters', () => {
		const filters = [
			{ column: 'city', value: 'New York', operator: '=' },
			{ column: 'age', value: 35, operator: '>=' }
		]
		const result = filterData(data, filters)
		expect(result).toEqual([{ name: 'Charlie', age: 35, city: 'New York' }])
	})

	it('should return an empty array when no rows match the filters', () => {
		const filters = [
			{ column: 'city', value: 'Paris', operator: '=' },
			{ column: 'age', value: 20, operator: '<' }
		]
		const result = filterData(data, filters)
		expect(result).toEqual([])

		// console.log(fromArray(data))
	})
})
