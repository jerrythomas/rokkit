import { describe, it, expect } from 'vitest'
import { FormValues } from '../../../src/lib/state/FormValues.svelte.js'

describe('FormValues', () => {
	it('reads and writes values by path', () => {
		const v = new FormValues({ a: 1, g: { b: 2 } })
		v.set('g/b', 5)
		v.set('a', 9)
		expect(v.get('g/b')).toBe(5)
		expect(v.data).toEqual({ a: 9, g: { b: 5 } })
	})

	it('tracks dirtiness against the initial snapshot', () => {
		const v = new FormValues({ a: 1, b: 2 })
		expect(v.isDirty).toBe(false)
		v.set('a', 3)
		expect(v.isDirty).toBe(true)
		expect([...v.dirtyFields]).toEqual(['a'])
		expect(v.isFieldDirty('a')).toBe(true)
		expect(v.isFieldDirty('b')).toBe(false)
		expect(v.initial('a')).toBe(1)
	})

	it('snapshot() makes the current data the new baseline; reset() restores it', () => {
		const v = new FormValues({ a: 1 })
		v.set('a', 2)
		v.snapshot()
		expect(v.isDirty).toBe(false)
		v.set('a', 7)
		v.reset()
		expect(v.get('a')).toBe(2)
	})

	it('the snapshot is a copy — mutating the data later does not move it', () => {
		const source = { list: [1] }
		const v = new FormValues(source)
		v.set('list', [1, 2])
		expect(v.initial('list')).toEqual([1])
	})

	it('replacing the data wholesale keeps the baseline', () => {
		const v = new FormValues({ a: 1 })
		v.data = { a: 1, extra: true }
		expect([...v.dirtyFields]).toEqual(['extra'])
	})
})
