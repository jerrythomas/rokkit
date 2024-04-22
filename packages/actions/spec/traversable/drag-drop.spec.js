import { describe, it, expect, beforeEach, afterAll } from 'vitest'
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
	const icons = Array.from(root.querySelectorAll('icon[data-state]'))
	const texts = Array.from(root.querySelectorAll('p'))

	describe('drag start', () => {
		const instance = traversable(root, { store: mockStore, options: { allowDrag: true } })
		beforeEach(() => {
			vi.resetAllMocks()
			mockStore.currentItem = vi.fn(() => ({ index: [0] }))
		})
		afterAll(() => {
			instance.destroy()
		})

		it('should not trigger any action', async () => {
			await fireEvent.dragStart(root)
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			// await fireEvent.dragOver(nodes[0])
			// expect(mockStore.dragOver).not.toHaveBeenCalled()
			// await fireEvent.drop(nodes[0])
			// expect(mockStore.dropOver).not.toHaveBeenCalled()
		})

		it.each(nodes)('should trigger dragStart on node drag', async (node) => {
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).toHaveBeenCalledWith(indices)
		})
		it.each(texts)('should trigger dragStart on content drag', async (node) => {
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).toHaveBeenCalledWith(indices)
		})
	})
	describe('drag over', () => {
		const instance = traversable(root, { store: mockStore, options: { allowDrop: true } })
		beforeEach(() => {
			vi.resetAllMocks()
			mockStore.currentItem = vi.fn(() => ({ index: [0] }))
		})
		afterAll(() => {
			instance.destroy()
		})
		it('should not trigger any action', async () => {
			await fireEvent.dragOver(root)
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.dragStart(nodes[0])
			expect(mockStore.dragStart).not.toHaveBeenCalled()
		})

		it.each(nodes)('should trigger dragOver on node drag', async (node) => {
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragOver(node)
			expect(mockStore.dragOver).toHaveBeenCalledWith(indices)
		})
		// it.each(texts)('should trigger dragOver on content drag', async (node) => {
		// 	const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
		// 	await fireEvent.dragOver(node)
		// 	expect(mockStore.dragOver).toHaveBeenCalledWith(indices)
		// })
	})
	describe('drop', () => {
		const instance = traversable(root, { store: mockStore, options: { allowDrop: true } })
		beforeEach(() => {
			vi.resetAllMocks()
			mockStore.currentItem = vi.fn(() => ({ index: [0] }))
		})
		afterAll(() => {
			instance.destroy()
		})
		it('should not trigger any action', async () => {
			await fireEvent.drop(root)
			expect(mockStore.dropOver).not.toHaveBeenCalled()
			await fireEvent.dragStart(nodes[0])
			expect(mockStore.dragStart).not.toHaveBeenCalled()
		})

		it.each(nodes)('should trigger drop on node drag', async (node) => {
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.drop(node)
			expect(mockStore.dropOver).toHaveBeenCalledWith(indices)
		})
	})
})
