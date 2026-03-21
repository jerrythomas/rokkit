import { describe, it, expect, vi } from 'vitest'
import {
	getClosestAncestorWithAttribute,
	noop,
	id,
	isObject,
	toString,
	iconShortcuts,
	scaledPath,
	getKeyFromPath,
	getPathFromKey,
	getSnippet,
	getImage,
	hex2rgb,
	colorToRgb
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
			expect(value.split('-')[0].length).toEqual(7)
		})
		it('should add a prefix if provided', () => {
			const value = id('prefix')
			expect(typeof value).toBe('string')
			expect(value.split('-')[0]).toEqual('prefix')
			expect(value.split('-')[1].length).toEqual(7)
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

	describe('getPathFromKey', () => {
		it('should get path from key', () => {
			expect(getPathFromKey('0-1-2')).toEqual([0, 1, 2])
			expect(getPathFromKey('0-1-2-3')).toEqual([0, 1, 2, 3])
			expect(getPathFromKey('0-1-2-3-4')).toEqual([0, 1, 2, 3, 4])
		})
	})

	describe('getKeyFromPath', () => {
		it('should get key from path', () => {
			expect(getKeyFromPath(0)).toEqual('0')
			expect(getKeyFromPath([0, 1, 2])).toEqual('0-1-2')
			expect(getKeyFromPath([1, 2, 3, 4])).toEqual('1-2-3-4')
			expect(getKeyFromPath([2, 3, 4, 5, 6])).toEqual('2-3-4-5-6')
		})
	})

	describe('getSnippet', () => {
		const data = {
			test: vi.fn(),
			icon: 'not-a-function'
		}
		it('should get snippet', () => {
			expect(getSnippet({}, 'test')).toBeNull()
			expect(getSnippet(data, 'icon')).toBeNull()
			expect(getSnippet(data, 'test')).toEqual(expect.any(Function))
		})
	})

	describe('getImage', () => {
		it('should identify url as image', () => {
			expect(getImage('https://example.com/image.jpg')).toEqual('https://example.com/image.jpg')
			expect(getImage('https://example.com/image.png')).toEqual('https://example.com/image.png')
			expect(getImage('https://example.com/image.gif')).toEqual('https://example.com/image.gif')
			expect(getImage('https://example.com/image.webp')).toEqual('https://example.com/image.webp')
			expect(getImage('https://example.com/image.svg')).toEqual('https://example.com/image.svg')
			expect(getImage('https://example.com/image.txt')).toEqual(null)
			expect(getImage('https://example.com/file.pdf')).toEqual(null)
		})

		it('should handle URLs with query parameters', () => {
			expect(getImage('https://example.com/image.jpg?v=123')).toEqual(
				'https://example.com/image.jpg?v=123'
			)
			expect(getImage('https://example.com/image.png?size=large&format=png')).toEqual(
				'https://example.com/image.png?size=large&format=png'
			)
		})

		it('should identify base 64 data as image', () => {
			expect(getImage('data:image/png;base64,iVBORw0KGgoAAAAN...')).toEqual(
				'data:image/png;base64,iVBORw0KGgoAAAAN...'
			)
			expect(getImage('data:image/jpeg;base64,/9j/4AAQSkZJRg...')).toEqual(
				'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
			)
			expect(getImage('i-app:iconify')).toEqual(null)
			expect(getImage('not-an-image')).toEqual(null)
		})

		it('should handle invalid URLs gracefully', () => {
			expect(getImage('not-a-url')).toEqual(null)
			expect(getImage('ftp://example.com/image.jpg')).toEqual(null)
			expect(getImage('http://')).toEqual(null)
			expect(getImage('')).toEqual(null)
		})

		it('should test URL constructor fallback when URL is unavailable', () => {
			// Mock URL being undefined to test fallback regex path
			const originalURL = global.URL
			global.URL = undefined

			expect(getImage('https://example.com/image.jpg')).toEqual('https://example.com/image.jpg')
			expect(getImage('https://example.com/image.txt')).toEqual(null)
			expect(getImage('https://example.com/image.png?v=1')).toEqual(
				'https://example.com/image.png?v=1'
			)

			// Restore original URL
			global.URL = originalURL
		})

		it('should handle URL constructor throwing errors', () => {
			// Mock URL constructor to throw an error to test catch block
			const originalURL = global.URL
			global.URL = class {
				constructor() {
					throw new Error('Invalid URL')
				}
			}

			expect(getImage('https://example.com/image.jpg')).toEqual('https://example.com/image.jpg')
			expect(getImage('https://example.com/image.txt')).toEqual(null)

			// Restore original URL
			global.URL = originalURL
		})
	})

	describe('colorToRgb', () => {
		it('converts hex to r,g,b', () => {
			expect(colorToRgb('#0f4c81')).toBe('15,76,129')
		})
		it('passes through oklch as-is', () => {
			expect(colorToRgb('oklch(60% 0.18 250)')).toBe('oklch(60% 0.18 250)')
		})
		it('passes through hsl as-is', () => {
			expect(colorToRgb('hsl(210 83% 27%)')).toBe('hsl(210 83% 27%)')
		})
		it('passes through named colors as-is', () => {
			expect(colorToRgb('rebeccapurple')).toBe('rebeccapurple')
		})
		it('returns non-string values as-is', () => {
			expect(colorToRgb(null)).toBeNull()
			expect(colorToRgb(undefined)).toBeUndefined()
		})
		it('passes through 3-digit hex as-is (no conversion)', () => {
			expect(colorToRgb('#fff')).toBe('#fff')
		})
	})

	describe('hex2rgb', () => {
		it('should convert hex color to rgb format', () => {
			expect(hex2rgb('#ff0000')).toBe('255,0,0')
			expect(hex2rgb('#00ff00')).toBe('0,255,0')
			expect(hex2rgb('#0000ff')).toBe('0,0,255')
			expect(hex2rgb('#ffffff')).toBe('255,255,255')
			expect(hex2rgb('#000000')).toBe('0,0,0')
		})

		it('should handle hex colors without hash', () => {
			expect(hex2rgb('ff0000')).toBe('255,0,0')
			expect(hex2rgb('00ff00')).toBe('0,255,0')
			expect(hex2rgb('0000ff')).toBe('0,0,255')
		})

		it('should handle mixed case hex colors', () => {
			expect(hex2rgb('#FF0000')).toBe('255,0,0')
			expect(hex2rgb('#AbCdEf')).toBe('171,205,239')
		})
	})
})
