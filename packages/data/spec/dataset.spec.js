import { describe, expect, it, beforeEach } from 'vitest'
import { clone } from 'ramda'
import { dataset } from '../src/dataset'
import { renamer } from '../src/renamer'
import joindata from './fixtures/join'
import scores from './fixtures/scores.json'

describe('dataset', () => {
	it('should return an object with methods', () => {
		const ds = dataset([])
		expect(ds).toEqual({
			override: expect.any(Function),
			where: expect.any(Function),
			groupBy: expect.any(Function),
			alignBy: expect.any(Function),
			using: expect.any(Function),
			summarize: expect.any(Function),
			sortBy: expect.any(Function),
			rename: expect.any(Function),
			delete: expect.any(Function),
			update: expect.any(Function),
			fillNA: expect.any(Function),
			rollup: expect.any(Function),
			apply: expect.any(Function),
			drop: expect.any(Function),
			select: expect.any(Function),
			union: expect.any(Function),
			minus: expect.any(Function),
			intersect: expect.any(Function),
			innerJoin: expect.any(Function),
			leftJoin: expect.any(Function),
			rightJoin: expect.any(Function),
			fullJoin: expect.any(Function),
			crossJoin: expect.any(Function),
			semiJoin: expect.any(Function),
			antiJoin: expect.any(Function),
			nestedJoin: expect.any(Function)
		})
	})
	describe('select', () => {
		it('should return the data', () => {
			const result = dataset(joindata.groups).select()
			expect(result).toEqual(joindata.groups)
		})
		it('should return the data with selected fields', () => {
			const result = dataset(joindata.ships).select('id', 'name')
			expect(result).toEqual([
				{ id: 10, name: 'Enterprise' },
				{ id: 20, name: "D'Kyr" },
				{ id: 30, name: 'Voyager' },
				{ id: 40, name: 'Narada' },
				{ id: 50, name: 'Bird of Prey' },
				{ id: 60, name: 'Scimitar' }
			])
		})
	})

	describe('where', () => {
		it('should return filtered data', () => {
			const result = dataset(joindata.ships)
				.where((ship) => ship.id > 30)
				.select()
			expect(result).toEqual([
				{ id: 40, name: 'Narada', group_id: 2 },
				{ id: 50, name: 'Bird of Prey' },
				{ id: 60, name: 'Scimitar' }
			])
		})
		it('should return filtered data with selected fields', () => {
			const result = dataset(joindata.ships)
				.where((ship) => ship.id > 30)
				.select('name')
			expect(result).toEqual([{ name: 'Narada' }, { name: 'Bird of Prey' }, { name: 'Scimitar' }])
		})
	})

	describe('set operations', () => {
		it('should perform union operation', () => {
			const result = dataset([{ a: 1 }, { a: 2 }])
				.union([{ a: 3 }, { a: 4 }])
				.select()
			expect(result).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }])
		})
		it('should perform intersect operation', () => {
			const result = dataset([{ a: 1 }, { a: 2 }])
				.intersect([{ a: 2 }, { a: 3 }])
				.select()
			expect(result).toEqual([{ a: 2 }])
		})
		it('should perform minus operation', () => {
			const result = dataset([{ a: 1 }, { a: 2 }])
				.minus([{ a: 2 }, { a: 3 }])
				.select()
			expect(result).toEqual([{ a: 1 }])
		})
	})

	describe('transform', () => {
		describe('rename', () => {
			it('should perform rename using function', () => {
				const { renameObject } = renamer({ prefix: 'x', keys: ['a'] }).get()
				const data = [{ a: 1 }, { a: 2 }]
				const result = dataset(data).rename(renameObject).select()
				expect(result).toEqual([{ x_a: 1 }, { x_a: 2 }])
				expect(result).not.toEqual(data)
			})
			it('should perform rename using a key map', () => {
				const data = [
					{ b: 'X', a: 1, c: 3 },
					{ a: 2, b: 'Y' }
				]
				const result = dataset(data).rename({ a: 'b' }).select()
				expect(result).toEqual([{ b: 1, c: 3 }, { b: 2 }])
				expect(result).not.toEqual(data)
			})
		})
		describe('drop', () => {
			it('should drop column', () => {
				const data = [{ a: 1, b: 2 }]

				const result = dataset(data).drop('a')
				expect(result.select()).toEqual([{ b: 2 }])
				expect(result.select()).not.toBe(data)
			})

			it('should drop multiple columns', () => {
				const data = [{ a: 1, b: 2, c: 3 }]
				const result = dataset(data).drop('a', 'c')
				expect(result.select()).toEqual([{ b: 2 }])
				expect(result.select()).not.toBe(data)
			})
		})
		describe('update', () => {
			let data = []

			beforeEach(() => {
				data = [
					{ a: 1, b: 2 },
					{ a: 2, b: 3 },
					{ a: 3, b: 4 }
				]
			})

			it('should throw error when input is not object', () => {
				expect(() => dataset(data).update('a')).toThrow('Value must be an object or function')
			})
			it('should update a record', () => {
				const result = dataset(data).update({ a: 'x' })
				expect(result.select()).toEqual([
					{ a: 'x', b: 2 },
					{ a: 'x', b: 3 },
					{ a: 'x', b: 4 }
				])
				expect(result.select()).not.toEqual(data)
			})

			it('should update a record with multiple attributes', () => {
				const result = dataset(data).update({ c: 2, y: 4 })
				expect(result.select()).toEqual([
					{ a: 1, b: 2, c: 2, y: 4 },
					{ a: 2, b: 3, c: 2, y: 4 },
					{ a: 3, b: 4, c: 2, y: 4 }
				])
				expect(result.select()).not.toEqual(data)
			})

			it('should update selected rows only', () => {
				const matcher = (row) => row.a === 2
				const result = dataset(data).where(matcher).update({ a: 9 })
				expect(result.select()).toEqual([
					{ a: 1, b: 2 },
					{ a: 9, b: 3 },
					{ a: 3, b: 4 }
				])
				expect(result.select()).not.toEqual(data)
			})

			it('should update using a function', () => {
				const result = dataset(data).update((row) => ({ ...row, a: row.a * 2 }))
				expect(result.select()).toEqual([
					{ a: 2, b: 2 },
					{ a: 4, b: 3 },
					{ a: 6, b: 4 }
				])
			})
		})
		describe('delete', () => {
			let data = []

			beforeEach(() => {
				data = [
					{ a: 1, b: 2 },
					{ a: 2, b: 3 },
					{ a: 3, b: 4 }
				]
			})

			it('should delete all records', () => {
				const result = dataset(data).delete()
				expect(result.select()).toEqual([])
				expect(result.select()).not.toEqual(data)
			})

			it('should delete selected rows only', () => {
				const matcher = (row) => row.a === 2
				const result = dataset(data).where(matcher).delete()
				expect(result.select()).toEqual([
					{ a: 1, b: 2 },
					{ a: 3, b: 4 }
				])
				expect(result.select()).not.toEqual(data)
			})
		})

		describe('fillNA', () => {
			it('should fill NA values', () => {
				const data = [
					{ a: 1, b: 2 },
					{ a: 2, b: null },
					{ a: null, b: 4 }
				]
				const result = dataset(data).fillNA({ b: 0 })
				expect(result.select()).toEqual([
					{ a: 1, b: 2 },
					{ a: 2, b: 0 },
					{ a: null, b: 4 }
				])
				expect(result.select()).not.toEqual(data)
			})
		})
		describe('sort', () => {
			let data = []
			beforeEach(() => {
				data = clone(scores)
			})
			it('should sort the data frame', () => {
				const result = dataset(data).sortBy('name')

				expect(result.select().map(({ name }) => name)).toEqual([
					'Heeyong Park',
					'Karine Abrahim',
					'Markus Ertelt',
					'Matias Chavez',
					'Myon Tuk Han',
					'Omar Zamitiz',
					'Ricardo de Oliviera',
					'Shaun Provost',
					'Shinobi Poli',
					'Simon Brunner',
					'Takehide Sato',
					'Toyohiko Kubota'
				])
				expect(result.select()).toEqual(data)
			})
			it('should sort the data frame in descending order', () => {
				const result = dataset(data).sortBy(['name', false])

				expect(result.select('name')).toEqual([
					{ name: 'Toyohiko Kubota' },
					{ name: 'Takehide Sato' },
					{ name: 'Simon Brunner' },
					{ name: 'Shinobi Poli' },
					{ name: 'Shaun Provost' },
					{ name: 'Ricardo de Oliviera' },
					{ name: 'Omar Zamitiz' },
					{ name: 'Myon Tuk Han' },
					{ name: 'Matias Chavez' },
					{ name: 'Markus Ertelt' },
					{ name: 'Karine Abrahim' },
					{ name: 'Heeyong Park' }
				])
				expect(result.select()).toEqual(data)
			})
			it('should sort by multiple columns', () => {
				const result = dataset(data).sortBy('country', 'name')

				expect(result.select('country', 'name')).toEqual([
					{ country: 'Brazil', name: 'Karine Abrahim' },
					{ country: 'Brazil', name: 'Ricardo de Oliviera' },
					{ country: 'Germany', name: 'Markus Ertelt' },
					{ country: 'Germany', name: 'Simon Brunner' },
					{ country: 'Japan', name: 'Takehide Sato' },
					{ country: 'Japan', name: 'Toyohiko Kubota' },
					{ country: 'Mexico', name: 'Matias Chavez' },
					{ country: 'Mexico', name: 'Omar Zamitiz' },
					{ country: 'South Korea', name: 'Heeyong Park' },
					{ country: 'South Korea', name: 'Myon Tuk Han' },
					{ country: 'United States', name: 'Shaun Provost' },
					{ country: 'United States', name: 'Shinobi Poli' }
				])
				expect(result.select()).toEqual(data)
			})
		})
	})

	describe('joins', () => {
		const child = dataset([...joindata.ships])
		const parent = dataset([...joindata.groups])
		const matcher = (child, parent) => child.group_id === parent.group_id

		it('should perform inner join', () => {
			const result = child.innerJoin(parent, matcher)
			expect(result.select()).toEqual(joindata.inner.no_rename)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform left join', () => {
			const result = child.leftJoin(parent, matcher)
			expect(result.select()).toEqual(joindata.left.no_rename)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform right join', () => {
			const result = child.rightJoin(parent, matcher)
			expect(result.select()).toEqual(joindata.right.no_rename)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform full join', () => {
			const result = child.fullJoin(parent, matcher)
			expect(result.select()).toEqual(joindata.full.no_rename)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform cross join', () => {
			const result = child.crossJoin(parent)
			expect(result.select()).toEqual(joindata.cross.no_rename)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform semi join', () => {
			const result = child.semiJoin(parent, matcher)
			expect(result.select()).toEqual(joindata.semi.no_rename)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform anti join', () => {
			const result = child.antiJoin(parent, matcher)
			expect(result.select()).toEqual(joindata.anti.no_rename)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform nested join', () => {
			const result = parent.nestedJoin(child, matcher)
			expect(result.select()).toEqual(joindata.nested)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
		it('should perform nested join with override', () => {
			const result = parent.override({ children: 'data' }).nestedJoin(child, matcher)
			expect(result.select()).toEqual(joindata.nested_override)
			expect(result).not.toEqual(child)
			expect(result).not.toEqual(parent)
		})
	})
})
