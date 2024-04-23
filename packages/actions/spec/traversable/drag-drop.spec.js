import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { traversable } from '../../src/traversable'
import { mockStore } from '../mocks/store'
import { createTree } from '../mocks/tree'

describe('traversable', () => {
	const items = [
		{ text: 'smith', children: [{ text: 'john' }, { text: 'jane' }] },
		{ text: 'hunt', children: [{ text: 'ethan' }, { text: 'emily' }] }
	]
	const root = createTree(items)
	document.body.appendChild(root)

	const nodes = Array.from(root.querySelectorAll('[data-index]'))
	const texts = Array.from(root.querySelectorAll('p'))

	describe('drag start', () => {
		beforeEach(() => {
			vi.resetAllMocks()
		})

		it('should not trigger any action', async () => {
			const instance = traversable(root, { store: mockStore, options: { allowDrag: true } })
			await fireEvent.dragStart(root)
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			await fireEvent.dragOver(nodes[0])
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.drop(nodes[0])
			expect(mockStore.dropOver).not.toHaveBeenCalled()
			instance.destroy()
		})

		it.each(nodes)('should trigger dragStart on node drag', async (node) => {
			const instance = traversable(root, { store: mockStore, options: { allowDrag: true } })
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).toHaveBeenCalledWith(indices)
			instance.destroy()
		})
		it.each(texts)('should trigger dragStart on content drag', async (node) => {
			const instance = traversable(root, { store: mockStore, options: { allowDrag: true } })
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).toHaveBeenCalledWith(indices)
			instance.destroy()
		})
	})
	describe('drag over', () => {
		beforeEach(() => {
			vi.resetAllMocks()
		})

		it('should not trigger any action', async () => {
			const instance = traversable(root, { store: mockStore, options: { allowDrop: true } })
			await fireEvent.dragOver(root)
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.dragStart(nodes[0])
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			instance.destroy()
		})

		it.each(nodes)('should trigger dragOver on node drag', async (node) => {
			const instance = traversable(root, { store: mockStore, options: { allowDrop: true } })
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragOver(node)
			expect(mockStore.dragOver).toHaveBeenCalledWith(indices)
			instance.destroy()
		})
		it.each(texts)('should trigger dragOver on content drag', async (node) => {
			const instance = traversable(root, { store: mockStore, options: { allowDrop: true } })
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragOver(node)
			expect(mockStore.dragOver).toHaveBeenCalledWith(indices)
			instance.destroy()
		})
	})
	describe('drop', () => {
		beforeEach(() => {
			vi.resetAllMocks()
		})
		it('should not trigger any action', async () => {
			const instance = traversable(root, { store: mockStore, options: { allowDrop: true } })

			await fireEvent.drop(root)
			expect(mockStore.dropOver).not.toHaveBeenCalled()
			await fireEvent.dragStart(nodes[0])
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			instance.destroy()
		})

		it.each(nodes)('should trigger drop on node drag', async (node) => {
			const instance = traversable(root, { store: mockStore, options: { allowDrop: true } })
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.drop(node)
			expect(mockStore.dropOver).toHaveBeenCalledWith(indices)
			instance.destroy()
		})
	})
})
