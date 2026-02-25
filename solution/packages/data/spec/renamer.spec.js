import { describe, expect, it } from 'vitest'
import { renamer } from '../src/renamer'

describe('renamer', () => {
	it('should return an object with methods', () => {
		expect(renamer()).toEqual({
			get: expect.any(Function),
			setPrefix: expect.any(Function),
			setSuffix: expect.any(Function),
			setKeys: expect.any(Function),
			setSeparator: expect.any(Function)
		})
	})

	describe('rename', () => {
		it('should not rename', () => {
			const action = renamer().get()
			expect(action.rename('a')).toBe('a')
			expect(action.rename('b')).toBe('b')
		})
		it('should rename using prefix', () => {
			let action = renamer({ prefix: 'a' }).get()
			expect(action.rename('b')).toBe('a_b')
			expect(action.rename('c')).toBe('a_c')

			action = renamer().setPrefix('a').get()
			expect(action.rename('b')).toBe('a_b')
			expect(action.rename('c')).toBe('a_c')
		})
		it('should rename using prefix and separator', () => {
			let action = renamer({ prefix: 'a', separator: '-' }).get()
			expect(action.rename('b')).toBe('a-b')
			expect(action.rename('c')).toBe('a-c')

			action = renamer().setPrefix('a').setSeparator('-').get()
			expect(action.rename('b')).toBe('a-b')
			expect(action.rename('c')).toBe('a-c')
		})
		it('should rename using suffix', () => {
			let action = renamer({ suffix: 'a' }).get()
			expect(action.rename('b')).toBe('b_a')
			expect(action.rename('c')).toBe('c_a')

			action = renamer().setSuffix('a').get()
			expect(action.rename('b')).toBe('b_a')
			expect(action.rename('c')).toBe('c_a')
		})
		it('should rename using suffix and separator', () => {
			let action = renamer({ suffix: 'a', separator: '-' }).get()
			expect(action.rename('b')).toBe('b-a')
			expect(action.rename('c')).toBe('c-a')

			action = renamer().setSuffix('a').setSeparator('-').get()
			expect(action.rename('b')).toBe('b-a')
			expect(action.rename('c')).toBe('c-a')
		})
	})

	describe('renameObject', () => {
		it('should not rename keys', () => {
			const obj = { a: 1, b: 2 }
			const action = renamer().get()
			expect(action.renameObject(obj)).toEqual({ a: 1, b: 2 })
		})
		it('should rename keys using prefix', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ prefix: 'a' }).get()
			expect(action.renameObject(obj)).toEqual({ a_b: 1, a_c: 2 })
			action = renamer().setPrefix('a').get()
			expect(action.renameObject(obj)).toEqual({ a_b: 1, a_c: 2 })
		})
		it('should rename keys using prefix and separator', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ prefix: 'a', separator: '-' }).get()
			expect(action.renameObject(obj)).toEqual({ 'a-b': 1, 'a-c': 2 })
			action = renamer().setPrefix('a').setSeparator('-').get()
			expect(action.renameObject(obj)).toEqual({ 'a-b': 1, 'a-c': 2 })
		})
		it('should rename keys using suffix', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ suffix: 'a' }).get()
			expect(action.renameObject(obj)).toEqual({ b_a: 1, c_a: 2 })
			action = renamer().setSuffix('a').get()
			expect(action.renameObject(obj)).toEqual({ b_a: 1, c_a: 2 })
		})
		it('should rename keys using suffix and separator', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ suffix: 'a', separator: '-' }).get()
			expect(action.renameObject(obj)).toEqual({ 'b-a': 1, 'c-a': 2 })
			action = renamer().setSuffix('a').setSeparator('-').get()
			expect(action.renameObject(obj)).toEqual({ 'b-a': 1, 'c-a': 2 })
		})
	})

	describe('forObjectsWithKeys', () => {
		const keys = ['a', 'b', 'c']

		it('should not rename keys', () => {
			const obj = { a: 1, b: 2 }
			let action = renamer({ keys }).get()
			expect(action.renameObject(obj)).toEqual({ a: 1, b: 2 })
			action = renamer().setKeys(keys).get()
			expect(action.renameObject(obj)).toEqual({ a: 1, b: 2 })
		})
		it('should rename keys using prefix', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ prefix: 'a', keys }).get()
			expect(action.renameObject(obj)).toEqual({ a_b: 1, a_c: 2 })
			action = renamer().setPrefix('a').setKeys(keys).get()
			expect(action.renameObject(obj)).toEqual({ a_b: 1, a_c: 2 })
		})
		it('should rename keys using prefix and separator', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ prefix: 'a', separator: '-', keys }).get()
			expect(action.renameObject(obj)).toEqual({ 'a-b': 1, 'a-c': 2 })
			action = renamer().setPrefix('a').setSeparator('-').setKeys(keys).get()
			expect(action.renameObject(obj)).toEqual({ 'a-b': 1, 'a-c': 2 })
		})
		it('should rename keys using suffix', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ suffix: 'a', keys }).get()
			expect(action.renameObject(obj)).toEqual({ b_a: 1, c_a: 2 })
			action = renamer().setSuffix('a').setKeys(keys).get()
			expect(action.renameObject(obj)).toEqual({ b_a: 1, c_a: 2 })
		})
		it('should rename keys using suffix and separator', () => {
			const obj = { b: 1, c: 2 }
			let action = renamer({ suffix: 'a', separator: '-', keys }).get()
			expect(action.renameObject(obj)).toEqual({ 'b-a': 1, 'c-a': 2 })
			action = renamer().setSuffix('a').setSeparator('-').setKeys(keys).get()
		})
	})
})
