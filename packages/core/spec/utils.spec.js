import { describe, it, expect, vi, afterEach } from 'vitest'
import {
	getClosestAncestorWithAttribute,
	detectDirection,
	isRTL,
	noop,
	id,
	isObject,
	toString,
	iconShortcuts,
	scaledPath,
	getKeyFromPath,
	getPathFromKey,
	getSnippet,
	resolveSnippet,
	getImage,
	hex2rgb,
	hex2oklch,
	oklch2hex,
	isIconClass
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
	describe('detectDirection / isRTL', () => {
		afterEach(() => document.documentElement.removeAttribute('dir'))

		it('defaults to ltr and is not RTL', () => {
			expect(detectDirection()).toBe('ltr')
			expect(isRTL()).toBe(false)
		})

		it('reflects a rtl html dir attribute', () => {
			document.documentElement.setAttribute('dir', 'rtl')
			expect(detectDirection()).toBe('rtl')
			expect(isRTL()).toBe(true)
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

	describe('resolveSnippet', () => {
		const named = vi.fn()
		const itemContent = vi.fn()
		const groupContent = vi.fn()
		const snippets = { observatoryHeader: named, itemContent, groupContent }
		// A proxy exposes its fields via .get() (like ProxyItem) — NOT a direct .snippet property.
		const proxy = (snippetName) => ({ get: (key) => (key === 'snippet' ? snippetName : undefined) })

		it('resolves a named snippet from the item snippet field (item level)', () => {
			expect(resolveSnippet(snippets, proxy('observatoryHeader'))).toBe(named)
		})

		it('resolves a named snippet at group level over the group fallback', () => {
			expect(resolveSnippet(snippets, proxy('observatoryHeader'), 'groupContent')).toBe(named)
		})

		it('falls back to groupContent for a group with no snippet field', () => {
			expect(resolveSnippet(snippets, proxy(undefined), 'groupContent')).toBe(groupContent)
		})

		it('falls back to itemContent for an item with no snippet field', () => {
			expect(resolveSnippet(snippets, proxy(undefined))).toBe(itemContent)
		})

		it('falls back to the default snippet when the named snippet is not provided', () => {
			expect(resolveSnippet(snippets, proxy('missing'))).toBe(itemContent)
		})

		it('returns null when neither a named snippet nor the fallback exists', () => {
			expect(resolveSnippet({}, proxy('observatoryHeader'))).toBeNull()
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

	describe('hex2oklch', () => {
		it('should convert pure red to oklch components', () => {
			const result = hex2oklch('#ff0000')
			const [L, C, H] = result.split(' ').map(Number)
			expect(L).toBeCloseTo(0.6279, 2)
			expect(C).toBeCloseTo(0.2577, 2)
			expect(H).toBeCloseTo(29.23, 0)
		})

		it('should convert white to oklch with zero chroma', () => {
			const result = hex2oklch('#ffffff')
			const [L, C] = result.split(' ').map(Number)
			expect(L).toBeCloseTo(1.0, 2)
			expect(C).toBeCloseTo(0, 2)
		})

		it('should convert black to oklch with zero lightness', () => {
			const result = hex2oklch('#000000')
			const [L, C] = result.split(' ').map(Number)
			expect(L).toBeCloseTo(0, 2)
			expect(C).toBeCloseTo(0, 2)
		})

		it('should return space-separated string', () => {
			const result = hex2oklch('#f97316')
			expect(result.split(' ')).toHaveLength(3)
		})
	})

	describe('oklch2hex', () => {
		it('should round-trip through hex2oklch', () => {
			const colors = ['#ff0000', '#00ff00', '#0000ff', '#f97316', '#64748b']
			for (const hex of colors) {
				const [L, C, H] = hex2oklch(hex).split(' ').map(Number)
				const result = oklch2hex(L, C, H)
				// Allow ±1 per channel for rounding
				const orig = hex.match(/\w\w/g).map((x) => parseInt(x, 16))
				const back = result.replace('#', '').match(/\w\w/g).map((x) => parseInt(x, 16))
				for (let i = 0; i < 3; i++) {
					expect(Math.abs(orig[i] - back[i])).toBeLessThanOrEqual(1)
				}
			}
		})
	})

	describe('isIconClass', () => {
		it('should return true for prefixed icon class strings', () => {
			expect(isIconClass('i-lucide:home')).toBe(true)
			expect(isIconClass('i-semantic:check')).toBe(true)
			expect(isIconClass('i-glyph:settings')).toBe(true)
		})

		it('should return true for bare semantic names (UnoCSS shortcuts)', () => {
			expect(isIconClass('file-svelte')).toBe(true)
			expect(isIconClass('folder-opened')).toBe(true)
			expect(isIconClass('navigate-down')).toBe(true)
		})

		it('should return false for literal single characters (kanji, emoji, letters)', () => {
			expect(isIconClass('聴')).toBe(false)
			expect(isIconClass('先')).toBe(false)
			expect(isIconClass('🏠')).toBe(false) // surrogate pair, single codepoint
			expect(isIconClass('A')).toBe(false)
		})

		it('should return false for empty/null values', () => {
			expect(isIconClass('')).toBe(false)
			expect(isIconClass(null)).toBe(false)
			expect(isIconClass(undefined)).toBe(false)
		})
	})
})