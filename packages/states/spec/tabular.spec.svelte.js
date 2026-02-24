import { describe, it, expect } from 'vitest'
import { TableController } from '../src/table-controller.svelte'
import { flushSync } from 'svelte'

const sampleData = [
	{ name: 'Alice', age: 28, city: 'Boston' },
	{ name: 'Bob', age: 35, city: 'Seattle' },
	{ name: 'Charlie', age: 22, city: 'Austin' }
]

describe('TableController', () => {
	it('should auto-derive columns from data', () => {
		const controller = new TableController(sampleData)
		expect(controller.columns.length).toBe(3)
		expect(controller.columns.map((c) => c.name)).toEqual(['name', 'age', 'city'])
	})

	it('should use provided columns', () => {
		const columns = [
			{ name: 'name', label: 'Full Name' },
			{ name: 'age', label: 'Age' }
		]
		const controller = new TableController(sampleData, { columns })
		expect(controller.columns.length).toBe(2)
		expect(controller.columns[0].label).toBe('Full Name')
		expect(controller.columns[0].sortable).toBe(true)
		expect(controller.columns[0].sorted).toBe('none')
	})

	it('should expose data from internal ListController', () => {
		const controller = new TableController(sampleData)
		expect(controller.data.length).toBe(3)
	})

	describe('sort', () => {
		it('should cycle sort: none → ascending → descending → none', () => {
			const controller = new TableController(sampleData)

			flushSync(() => controller.sortBy('name'))
			expect(controller.sortState).toEqual([{ column: 'name', direction: 'ascending' }])
			expect(controller.columns.find((c) => c.name === 'name').sorted).toBe('ascending')

			flushSync(() => controller.sortBy('name'))
			expect(controller.sortState).toEqual([{ column: 'name', direction: 'descending' }])

			flushSync(() => controller.sortBy('name'))
			expect(controller.sortState).toEqual([])
			expect(controller.columns.find((c) => c.name === 'name').sorted).toBe('none')
		})

		it('should sort data ascending', () => {
			const controller = new TableController(sampleData)
			flushSync(() => controller.sortBy('age'))
			const ages = controller.data.map((d) => d.value.age)
			expect(ages).toEqual([22, 28, 35])
		})

		it('should sort data descending', () => {
			const controller = new TableController(sampleData)
			flushSync(() => controller.sortBy('age'))
			flushSync(() => controller.sortBy('age'))
			const ages = controller.data.map((d) => d.value.age)
			expect(ages).toEqual([35, 28, 22])
		})

		it('should support multi-column sort with extend', () => {
			const data = [
				{ name: 'Alice', dept: 'Eng' },
				{ name: 'Bob', dept: 'Design' },
				{ name: 'Charlie', dept: 'Eng' },
				{ name: 'Diana', dept: 'Design' }
			]
			const controller = new TableController(data)

			flushSync(() => controller.sortBy('dept'))
			flushSync(() => controller.sortBy('name', true))

			expect(controller.sortState).toEqual([
				{ column: 'dept', direction: 'ascending' },
				{ column: 'name', direction: 'ascending' }
			])
		})

		it('should clear sort state', () => {
			const controller = new TableController(sampleData)
			flushSync(() => controller.sortBy('name'))
			flushSync(() => controller.clearSort())
			expect(controller.sortState).toEqual([])
			expect(controller.columns.every((c) => c.sorted === 'none')).toBe(true)
		})

		it('should not sort non-sortable columns', () => {
			const columns = [{ name: 'name', sortable: false }]
			const controller = new TableController(sampleData, { columns })
			controller.sortBy('name')
			expect(controller.sortState).toEqual([])
		})
	})

	describe('navigation', () => {
		it('should move focus with moveFirst/moveLast', () => {
			const controller = new TableController(sampleData)
			controller.moveFirst()
			expect(controller.focusedKey).toBe('0')
			controller.moveLast()
			expect(controller.focusedKey).toBe('2')
		})

		it('should move focus with moveNext/movePrev', () => {
			const controller = new TableController(sampleData)
			controller.moveFirst()
			controller.moveNext()
			expect(controller.focusedKey).toBe('1')
			controller.movePrev()
			expect(controller.focusedKey).toBe('0')
		})
	})

	describe('selection', () => {
		it('should select a row', () => {
			const controller = new TableController(sampleData)
			controller.moveFirst()
			controller.select()
			expect(controller.selectedKeys.size).toBe(1)
			expect(controller.selectedKeys.has('0')).toBe(true)
		})
	})

	describe('update', () => {
		it('should update data and re-apply sort', () => {
			const controller = new TableController(sampleData)
			flushSync(() => controller.sortBy('age'))

			const newData = [
				{ name: 'Xander', age: 40, city: 'Denver' },
				{ name: 'Yuki', age: 19, city: 'Tokyo' }
			]
			flushSync(() => controller.update(newData))

			const ages = controller.data.map((d) => d.value.age)
			expect(ages).toEqual([19, 40])
		})
	})
})
