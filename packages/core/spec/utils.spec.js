import { describe, it, expect } from 'vitest'
import {
	getClosestAncestorWithAttribute,
	noop,
	id,
	isObject,
	toString,
	iconShortcuts,
	scaledPath
} from '../src/utils.js'

describe('utils', () => {
	describe('getClosestAncestorWithAttribute', () => {
		it('should return null if element does not have the given attribute and is orphan', () => {
			const element = document.createElement('div')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(null)
		})
		it('should return the element if it has the given attribute', () => {
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(element)
		})
		it('should return the element if it has the given attribute and is nested', () => {
			const parent = document.createElement('div')
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(element)
		})
		it('should return the closest ancestor if it has the given attribute', () => {
			const element = document.createElement('div')
			const parent = document.createElement('div')
			parent.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(parent)
		})
	})
	describe('noop', () => {
		it('should be a function', () => {
			expect(typeof noop).toBe('function')
			expect(noop()).toBeUndefined()
		})
	})
	describe('id', () => {
		it('should generate a random id', () => {
			const value = id()
			expect(typeof value).toBe('string')
			expect(value.length).toEqual(7)
		})
	})

	describe('isObject', () => {
		it('should return true for objects', () => {
			expect(isObject({})).toBe(true)
			expect(isObject({ a: 1 })).toBe(true)
		})
		it('should return false for non-objects', () => {
			expect(isObject(null)).toBe(false)
			expect(isObject()).toBe(false)
			expect(isObject(1)).toBe(false)
			expect(isObject('')).toBe(false)
			expect(isObject(true)).toBe(false)
			expect(isObject(false)).toBe(false)
			expect(isObject(new Date())).toBe(false)
		})
	})

	describe('toString', () => {
		it('should convert to string', () => {
			expect(toString(1)).toEqual('1')
			expect(toString('a')).toEqual('a')
			expect(toString(true)).toEqual('true')
			expect(toString(false)).toEqual('false')
			expect(toString(null)).toEqual(null)
			expect(toString()).toBeUndefined()
			expect(toString({})).toEqual('{}')
			expect(toString([])).toEqual('[]')
		})
	})

	describe('iconShortcuts', () => {
		it('should not generate shortcuts', () => {
			expect(iconShortcuts(['rating-filled', 'rating-empty'])).toEqual({})
		})
		it('should generate shortcuts', () => {
			expect(iconShortcuts(['rating-filled', 'rating-empty', 'action-sort-up'], 'x')).toEqual({
				'rating-filled': 'x:rating-filled',
				'rating-empty': 'x:rating-empty',
				'action-sort-up': 'x:action-sort-up'
			})
		})
		it('should generate variants', () => {
			expect(
				iconShortcuts(['rating-filled', 'rating-empty', 'action-sort-up'], 'x', 'solid')
			).toEqual({
				'rating-filled': 'x:rating-filled-solid',
				'rating-empty': 'x:rating-empty-solid',
				'action-sort-up': 'x:action-sort-up-solid'
			})
		})
	})

	describe('scaledPath', () => {
		it('should generate a scaled path', () => {
			expect(scaledPath(10, ['M', 1, 2])).toEqual('M 10 20')
			expect(scaledPath(5, ['A', 0.1, 0.1, 0, 0, 0, 0, 0.1])).toEqual('A 0.5 0.5 0 0 0 0 0.5')
			expect(scaledPath(5, ['A', 0.1, 0.1, 0, 0, 0, 0, 0.1, 'V', 1, 2])).toEqual(
				'A 0.5 0.5 0 0 0 0 0.5 V 5 10'
			)

			expect(
				scaledPath(5, [
					['A', 0.1, 0.1, 0, 0, 0, 0, 0.1],
					['V', 1, 2]
				])
			).toEqual('A 0.5 0.5 0 0 0 0 0.5 V 5 10')
		})
	})
})
