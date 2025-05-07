/* eslint-disable no-console */
import { describe, it, expect, vi } from 'vitest'
import {
	getMockNode,
	createNestedElement,
	elementsWithSize,
	mixedSizeElements,
	mockFormRequestSubmit
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
			const result = elementsWithSize(10, 20)
			expect(result.length).toBe(10)
			result.forEach((element) => {
				expect(element.offsetHeight).toBe(20)
			})
		})
		it('should return an array of elements with offsetWidth property', () => {
			const result = elementsWithSize(10, 20, 'offsetWidth')
			expect(result.length).toBe(10)
			result.forEach((element) => {
				expect(element.offsetWidth).toBe(20)
			})
		})
	})

	describe('mixedSizeElements', () => {
		it('should create an array of mixed size elements', () => {
			const result = mixedSizeElements([
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
			const result = mixedSizeElements(
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

	describe('mockFormRequestSubmit', () => {
		it('should detect unimplemented requestSubmit before mocking', () => {
			console.error = vi.fn()
			// Create a form and try to use requestSubmit
			const form = document.createElement('form')
			form.requestSubmit()
			expect(console.error).toHaveBeenCalled()
			expect(console.error.mock.calls[0][0]).toContain('Not implemented')

			vi.resetAllMocks()
		})

		it('should mock form requestSubmit', () => {
			// Apply the mock
			const mockWasApplied = mockFormRequestSubmit()

			// Verify the function returns true (indicating mock was applied)
			expect(mockWasApplied).toBe(true)
			// eslint-disable-next-line no-undef
			expect(vi.isMockFunction(HTMLFormElement.prototype.requestSubmit)).toBeTruthy()

			// Test the mock implementation works correctly
			const form = document.createElement('form')
			const submitSpy = vi.fn()
			form.addEventListener('submit', submitSpy)

			form.requestSubmit()
			expect(submitSpy).toHaveBeenCalled()
			// eslint-disable-next-line no-undef
			expect(HTMLFormElement.prototype.requestSubmit).toHaveBeenCalled()

			vi.resetAllMocks()
		})
	})
})
