import { describe, it, expect } from 'vitest'
import { getMockNode, createNestedElement } from '../../src/mocks/element'

describe('element', () => {
	describe('getMockNode', () => {
		it('should return a mock node', () => {
			const node = getMockNode(['click'])
			expect(node).toEqual({
				node: {
					addEventListener: expect.any(Function),
					removeEventListener: expect.any(Function)
				},
				listeners: { click: 0 }
			})
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
})
