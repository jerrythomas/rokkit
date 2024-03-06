import { describe, it, expect } from 'vitest'
import { tabular } from '../src/tabular'

describe('tabular', () => {
	it('should create a datatable', () => {})
	describe('deriveColumnMetadata', () => {
		it('should derive column metadata', () => {
			const data = [
				{ name: 'John', age: 25, salary: 50000 },
				{ name: 'Jane', age: 30, salary: 60000 }
			]
			const metadata = tabular(data)
			expect(metadata.columns).toEqual([
				{
					name: 'name',
					dataType: 'string',
					fields: { text: 'name' },
					formatter: expect.any(Function)
				},
				{
					name: 'age',
					dataType: 'number',
					fields: { text: 'age' },
					formatter: expect.any(Function)
				},
				{
					name: 'salary',
					dataType: 'number',
					fields: { text: 'salary' },
					formatter: expect.any(Function)
				}
			])
		})

		it('should derive column metadata with currency', () => {
			const data = [
				{ name: 'John', age: 25, salary: 50000, salary_currency: 'USD' },
				{ name: 'Jane', age: 30, salary: 60000, salary_currency: 'EUR' }
			]
			const metadata = tabular(data)

			expect(metadata.columns).toEqual([
				{
					name: 'name',
					dataType: 'string',
					fields: { text: 'name' },
					formatter: expect.any(Function)
				},
				{
					name: 'age',
					dataType: 'number',
					fields: { text: 'age' },
					formatter: expect.any(Function)
				},
				{
					name: 'salary',
					dataType: 'currency',
					fields: { text: 'salary', currency: 'salary_currency' },
					formatter: expect.any(Function)
				}
			])

			expect(metadata.columns[2].formatter(50000)).toBe('$50,000.00')
			expect(metadata.columns[2].formatter(50000, 'EUR')).toBe('€50,000.00')
		})
	})
})
