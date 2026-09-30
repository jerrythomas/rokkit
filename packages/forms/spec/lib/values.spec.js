import { describe, it, expect } from 'vitest'
import { deepClone, deepEqual, getPath, setPath } from '../../src/lib/values.js'

describe('deepClone', () => {
	it('copies plain values and leaves primitives alone', () => {
		const src = { a: [1, { b: 2 }] }
		const copy = deepClone(src)
		expect(copy).toEqual(src)
		expect(copy).not.toBe(src)
		expect(deepClone(3)).toBe(3)
		expect(deepClone(null)).toBeNull()
		expect(deepClone(undefined)).toBeUndefined()
	})
})

describe('deepEqual', () => {
	it('compares primitives, arrays and objects structurally', () => {
		expect(deepEqual(1, 1)).toBe(true)
		expect(deepEqual({ a: [1, 2] }, { a: [1, 2] })).toBe(true)
		expect(deepEqual({ a: [1, 2] }, { a: [2, 1] })).toBe(false)
		expect(deepEqual([1], [1, 2])).toBe(false)
		expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
		expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
	})
	it('never equates mixed array/object or nullish with a value', () => {
		expect(deepEqual([], {})).toBe(false)
		expect(deepEqual(null, {})).toBe(false)
		expect(deepEqual(undefined, 0)).toBe(false)
		expect(deepEqual('1', 1)).toBe(false)
	})
})

describe('getPath / setPath', () => {
	it('reads a slash path, undefined past a non-object', () => {
		const data = { a: { b: 2 }, s: 'x' }
		expect(getPath(data, 'a/b')).toBe(2)
		expect(getPath(data, 's/deeper')).toBeUndefined()
		expect(getPath(data, '')).toBeUndefined()
	})
	it('writes immutably, creating intermediate objects', () => {
		const data = { a: { b: 2 }, keep: 1 }
		const next = setPath(data, 'a/c', 3)
		expect(next).toEqual({ a: { b: 2, c: 3 }, keep: 1 })
		expect(data.a).toEqual({ b: 2 })
		expect(setPath({}, 'x/y', 1)).toEqual({ x: { y: 1 } })
		expect(setPath({ t: 1 }, 't', 2)).toEqual({ t: 2 })
	})
})

describe('toFieldPath', () => {
	it('strips a leading JSON Forms "#/" and leaves a bare path alone', async () => {
		const { toFieldPath } = await import('../../src/lib/values.js')
		expect(toFieldPath('#/addr/city')).toBe('addr/city')
		expect(toFieldPath('addr/city')).toBe('addr/city')
		expect(toFieldPath('#/')).toBe('')
		expect(toFieldPath('')).toBe('')
		expect(toFieldPath(undefined)).toBeUndefined()
	})
})
