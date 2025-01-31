import { describe, expect, it } from 'vitest'
import { model } from '../src/model'

describe('model', () => {
	it('should return an object with the correct methods', () => {
		const first = model()
		expect(first).toEqual({
			get: expect.any(Function),
			clone: expect.any(Function),
			renameUsing: expect.any(Function),
			from: expect.any(Function),
			merge: expect.any(Function)
		})
		expect(first.get()).toEqual([])
	})
	it('should derive model from data', () => {
		let first = model().from([{ id: 1 }, { name: 'Alpha' }])
		expect(Object.keys(first)).toEqual(['get', 'clone', 'renameUsing', 'from', 'merge'])
		expect(first.get()).toEqual([{ name: 'id', type: 'integer' }])
		first = model().from({ id: 1 })
		expect(first.get()).toEqual([{ name: 'id', type: 'integer' }])
	})

	it('should allow deep scan', () => {
		const first = model()
			// .useDeepScan()
			.from([{ name: 'Alpha' }, { id: 1 }], true)
		expect(first.get()).toEqual([
			{ name: 'name', type: 'string' },
			{ name: 'id', type: 'integer' }
		])
	})

	it('should merge models', () => {
		const second = model().from([{ id: 1 }])
		const first = model()
			.from([{ name: 'Alpha' }])
			.merge(second)
		expect(first.get()).toEqual([
			{ name: 'name', type: 'string' },
			{ name: 'id', type: 'integer' }
		])
	})

	it('should merge models with rename', () => {
		const second = model()
			.from([{ id: 1 }])
			.renameUsing((x) => ['y', x].join('_'))
		const first = model()
			.from([{ name: 'Alpha' }])
			.renameUsing((x) => ['x', x].join('_'))
			.merge(second)
		expect(first.get()).toEqual([
			{ name: 'x_name', type: 'string' },
			{ name: 'y_id', type: 'integer' }
		])
	})

	it('should merge models with conflicts', () => {
		const second = model().from([{ id: 1, name: 'Beta' }])
		const first = model()
			.from([{ id: 'Alpha', name: 'Alpha' }])
			.merge(second)
		expect(first.get()).toEqual([
			{ name: 'id', type: 'string', mixedTypes: true },
			{ name: 'name', type: 'string' }
		])
	})

	it('should merge models using override for conflicts', () => {
		const second = model().from([{ id: 1, name: 'Beta' }])
		const first = model().from([{ id: 'Alpha', name: 'Alpha' }])
		const result = model().clone(first).merge(second, true)
		expect(result.get()).toEqual([
			{ name: 'id', type: 'integer', mixedTypes: true },
			{ name: 'name', type: 'string' }
		])
		expect(first.get()).toEqual([
			{ name: 'id', type: 'string' },
			{ name: 'name', type: 'string' }
		])
	})
})
