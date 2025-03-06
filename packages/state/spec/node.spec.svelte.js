import { describe, it, expect, beforeEach } from 'vitest'
import { Node } from '../src/node'
import { FieldMapper } from '@rokkit/core'

describe('Node', () => {
	let mapper

	beforeEach(() => {
		mapper = new FieldMapper()
	})

	describe('basic properties', () => {
		it('should provide access to original data properties', () => {
			const data = { id: 1, text: 'Test' }
			const node = new Node(data, mapper)

			expect(node.id).toBe(1)
			expect(node.text).toBe('Test')
		})

		it('should update original when properties are modified', () => {
			const data = { id: 1, text: 'Test' }
			const node = new Node(data, mapper)

			node.text = 'Updated'

			expect(data.text).toBe('Updated')
			expect(node.text).toBe('Updated')
		})

		it('should maintain reactivity', () => {
			const data = { id: 1, text: 'Test' }
			const node = new Node(data, mapper)
			const derivedText = $derived.by(() => node.text)

			node.text = 'Updated'
			expect(derivedText).toBe('Updated')
		})
	})

	describe('children operations', () => {
		it('should initialize with children as nodes', () => {
			const data = {
				id: 1,
				children: [
					{ id: 2, text: 'Child 1' },
					{ id: 3, text: 'Child 2' }
				]
			}
			const node = new Node(data, mapper)

			expect(node.children.length).toBe(2)
			expect(node.children[0]).toBeInstanceOf(Node)
			expect(node.children[0].id).toBe(2)
		})

		it('should add child node', () => {
			const data = { id: 1, children: [] }
			const node = new Node(data, mapper)

			const newChild = node.addChild({ id: 2, text: 'New Child' })

			expect(node.children.length).toBe(1)
			expect(node.children[0]).toBe(newChild)
			expect(node.original.children.length).toBe(1)
			expect(node.original.children[0].id).toBe(2)
			expect(data.children.length).toBe(1)
			expect(data.children[0].id).toBe(2)
		})

		it('should add child to node without children array', () => {
			const data = { id: 1 }
			const node = new Node(data, mapper)

			const newChild = node.addChild({ id: 2, text: 'New Child' })

			expect(node.children.length).toBe(1)
			expect(node.children[0]).toBe(newChild)
			expect(Array.isArray(node.original.children)).toBe(true)
		})

		it('should remove child node', () => {
			const data = {
				id: 1,
				children: [
					{ id: 2, text: 'Child 1' },
					{ id: 3, text: 'Child 2' }
				]
			}
			const node = new Node(data, mapper)
			const childToRemove = node.children[0]

			const removed = node.removeChild(childToRemove)

			expect(removed).toBe(true)
			expect(node.children.length).toBe(1)
			expect(node.original.children.length).toBe(1)
			expect(node.children[0].id).toBe(3)
		})

		it('should return false if child is not found', () => {
			const data = {
				id: 1,
				children: [
					{ id: 2, text: 'Child 1' },
					{ id: 3, text: 'Child 2' }
				]
			}
			const node = new Node(data, mapper)
			const childToRemove = { id: 4, text: 'Child 3' }

			const removed = node.removeChild(childToRemove)

			expect(removed).toBe(false)
			expect(node.children.length).toBe(2)
			expect(node.original.children.length).toBe(2)
		})
	})
})
