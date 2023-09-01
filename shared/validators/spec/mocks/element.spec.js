import { describe, it, expect } from 'vitest'
import {
	getMockNode,
	createNestedElement,
	elementsWithSize,
	mixedSizeElements
} from '../../src/mocks/element'

describe('element', () => {
	describe('getMockNode', () => {
		it('should return a mock node', () => {
			const node = getMockNode(['click'])
			expect(node).toEqual({
				node: {
					scrollTo: expect.any(Function),
					querySelector: expect.any(Function),
					querySelectorAll: expect.any(Function),
					dispatchEvent: expect.any(Function),
					addEventListener: expect.any(Function),
					removeEventListener: expect.any(Function)
				},
				listeners: { click: 0 }
			})
		})
		it('should get a mock node for querySelector', () => {
			const { node } = getMockNode(['click'])

			expect(typeof node.querySelector('div')).toEqual('object')
			expect(Array.isArray(node.querySelectorAll('div'))).toBeTruthy()
		})
	})

	describe('createNestedElement', () => {
		it('should return a mock nested node', () => {
			const item = {
				name: 'div'
			}
			const node = createNestedElement(item)
			expect(node.getAttribute('id')).toBeFalsy()
			expect(node.getAttribute('data-path')).toBeFalsy()
			expect(node.scrollIntoView).toEqual(expect.any(Function))
			expect(node.children.length).toBe(0)
		})

		it('should return a mock nested node with id', () => {
			const item = {
				name: 'div',
				id: 'foo'
			}
			const node = createNestedElement(item)
			expect(node.getAttribute('id')).toBe('foo')
			expect(node.getAttribute('data-path')).toBeFalsy()
			expect(node.scrollIntoView).toEqual(expect.any(Function))
			expect(node.children.length).toBe(0)
		})

		it('should return a mock nested node with data-path', () => {
			const item = {
				name: 'div',
				dataPath: 'foo'
			}
			const node = createNestedElement(item)
			expect(node.getAttribute('id')).toBeFalsy()
			expect(node.getAttribute('data-path')).toBe('foo')
			expect(node.scrollIntoView).toEqual(expect.any(Function))
			expect(node.children.length).toBe(0)
		})

		it('should return a mock nested node with children', () => {
			const item = {
				name: 'div',
				children: [
					{
						name: 'div'
					}
				]
			}
			const node = createNestedElement(item)
			expect(node.getAttribute('id')).toBeFalsy()
			expect(node.getAttribute('data-path')).toBeFalsy()
			expect(node.scrollIntoView).toEqual(expect.any(Function))
			expect(node.children.length).toBe(1)
		})
	})

	describe('elementsWithSize', () => {
		it('should return an array of elements with offsetHeight property', () => {
			let result = elementsWithSize(10, 20)
			expect(result.length).toBe(10)
			result.forEach((element) => {
				expect(element.offsetHeight).toBe(20)
			})
		})
		it('should return an array of elements with offsetWidth property', () => {
			let result = elementsWithSize(10, 20, 'offsetWidth')
			expect(result.length).toBe(10)
			result.forEach((element) => {
				expect(element.offsetWidth).toBe(20)
			})
		})
	})

	describe('mixedSizeElements', () => {
		it('should create an array of mixed size elements', () => {
			let result = mixedSizeElements([
				{ count: 10, size: 20 },
				{ count: 5, size: 10 }
			])
			expect(result.length).toBe(15)
			result.forEach((element, index) => {
				if (index < 10) {
					expect(element.offsetHeight).toBe(20)
				} else {
					expect(element.offsetHeight).toBe(10)
				}
			})
		})
		it('should create an array of mixed size elements with offsetWidth', () => {
			let result = mixedSizeElements(
				[
					{ count: 10, size: 20 },
					{ count: 5, size: 10 }
				],
				'offsetWidth'
			)
			expect(result.length).toBe(15)
			result.forEach((element, index) => {
				if (index < 10) {
					expect(element.offsetWidth).toBe(20)
				} else {
					expect(element.offsetWidth).toBe(10)
				}
			})
		})
	})
})
