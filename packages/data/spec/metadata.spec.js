import { describe, it, expect } from 'vitest'
import { deriveColumnProperties, addPathModifier, deriveColumnMetadata } from '../src/metadata'

describe('metadata', () => {
	describe('deriveColumnMetadata', () => {
		it('should identify metadata for sparse values', () => {
			const data = [{ a: 1 }, { b: 2 }]
			const metadata = deriveColumnMetadata(data, { deepScan: true })
			expect(metadata).toEqual([
				{ name: 'a', type: 'integer' },
				{ name: 'b', type: 'integer' }
			])
		})

		it('should return predefined metadata if provided', () => {
			const data = [{ a: 1 }, { b: 2 }]
			const metadata = deriveColumnMetadata(data, {
				deepScan: true,
				metadata: [{ name: 'a', type: 'string' }]
			})
			expect(metadata).toEqual([{ name: 'a', type: 'string' }])
		})
		it('should return empty if data is empty', () => {
			const metadata = deriveColumnMetadata([])
			expect(metadata).toEqual([])
		})
		it('should identify metadata from first row', () => {
			const data = [{ name: 'John', age: 25 }]
			const metadata = deriveColumnMetadata(data)
			expect(metadata).toEqual([
				{ name: 'name', type: 'string' },
				{ name: 'age', type: 'integer' }
			])
		})
	})
	describe('deriveColumnProperties', () => {
		it('should derive column properties', () => {
			const sample = {
				name: 'John',
				age: 25,
				amount: 1000,
				amount_currency: 'USD'
			}

			const columns = deriveColumnProperties(sample)
			expect(columns).toEqual([
				{
					name: 'name',
					type: 'string',
					fields: { text: 'name' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				},
				{
					name: 'age',
					type: 'integer',
					fields: { text: 'age' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				},
				{
					name: 'amount',
					type: 'currency',
					fields: { text: 'amount', currency: 'amount_currency' },
					digits: 2,
					sortable: true,
					filterable: true,
					sorted: 'none'
				}
			])
		})

		it('should derive column properties with custom path', () => {
			const sample = {
				name: 'John',
				lineage: 'Adam/Smith'
			}

			const columns = deriveColumnProperties(sample, { path: 'lineage' })
			expect(columns).toEqual([
				{
					name: 'lineage',
					type: 'string',
					path: true,
					separator: '/',
					fields: { text: 'lineage' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				},
				{
					name: 'name',
					type: 'string',
					fields: { text: 'name' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				}
			])
		})

		it('should derive column properties with custom path and separator', () => {
			const sample = {
				name: 'John',
				lineage: 'Adam-Smith'
			}

			const columns = deriveColumnProperties(sample, { path: 'lineage', separator: '-' })
			expect(columns).toEqual([
				{
					name: 'lineage',
					type: 'string',
					path: true,
					separator: '-',
					fields: { text: 'lineage' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				},
				{
					name: 'name',
					type: 'string',
					fields: { text: 'name' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				}
			])
		})

		it('should include unmatched columns with currency suffix', () => {
			const sample = {
				amount: 1000,
				amt_currency: 'USD'
			}
			const columns = deriveColumnProperties(sample)
			expect(columns).toEqual([
				{
					name: 'amount',
					type: 'integer',
					fields: { text: 'amount' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				},
				{
					name: 'amt_currency',
					type: 'string',
					fields: { text: 'amt_currency' },
					sortable: true,
					filterable: true,
					sorted: 'none'
				}
			])
		})

		it('should work with custom currency suffix', () => {
			const sample = {
				amount: 1000,
				amount_curr: 'USD'
			}
			const columns = deriveColumnProperties(sample, { currencySuffix: '_curr' })
			expect(columns).toEqual([
				{
					name: 'amount',
					type: 'currency',
					fields: { text: 'amount', currency: 'amount_curr' },
					digits: 2,
					sortable: true,
					filterable: true,
					sorted: 'none'
				}
			])
		})
	})

	describe('addPathModifier', () => {
		const columns = [
			{ name: 'name', type: 'string' },
			{ name: 'path', type: 'string' }
		]

		it('should return input as is when path is not provided', () => {
			const result = addPathModifier(columns)
			expect(result).toEqual(columns)
		})
		it('should return input as is when path is invalid', () => {
			const result = addPathModifier(columns, 'age')
			expect(result).toEqual(columns)
		})

		it('should add path modifier', () => {
			const result = addPathModifier(columns, 'path')
			expect(result).toEqual([
				{ name: 'path', type: 'string', path: true },
				{ name: 'name', type: 'string' }
			])
		})
	})
})
