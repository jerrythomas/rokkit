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

	describe('select', () => {
		const instance = traversable(root, { store: mockStore })
		beforeEach(() => {
			vi.resetAllMocks()
			mockStore.currentItem = vi.fn(() => ({ index: [0] }))
		})
		afterAll(() => {
			instance.destroy()
		})

		it('should not trigger any action', async () => {
			await fireEvent.click(root)
			await fireEvent.click(root, { shiftKey: true })
			await fireEvent.click(root, { ctrlKey: true })
			await fireEvent.click(root, { metaKey: true })
			expect(mockStore.select).not.toHaveBeenCalled()
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			expect(mockStore.toggleSelection).not.toHaveBeenCalled()
			expect(mockStore.toggleExpansion).not.toHaveBeenCalled()
			await fireEvent.dragStart(root)
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			await fireEvent.dragOver(root)
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.drop(root)
			expect(mockStore.dropOver).not.toHaveBeenCalled()
		})
		it.each(nodes)('should not trigger drag/drop actions', async (node) => {
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			await fireEvent.dragOver(node)
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.drop(node)
			expect(mockStore.dropOver).not.toHaveBeenCalled()
			// await fireEvent.dragEnd(node)
			// expect(mockStore.dragEnd).not.toHaveBeenCalled()
		})

		it.each(nodes)('should trigger select on node click', async (node) => {
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node)
			expect(mockStore.select).toHaveBeenCalledWith(indices)
		})
		it.each(texts)('should trigger select on content click', async (node) => {
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node)
			expect(mockStore.select).toHaveBeenCalledWith(indices)
		})

		it.each(icons)('should trigger toggleExpansion on icon click', async (icon) => {
			const indices = icon.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(icon)
			expect(mockStore.toggleExpansion).toHaveBeenCalledWith(indices)
			expect(mockStore.select).not.toHaveBeenCalled()
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			expect(mockStore.toggleSelection).not.toHaveBeenCalled()
		})
	})

	describe('multiselect', () => {
		const instance = traversable(root, { store: mockStore, options: { multiselect: true } })

		beforeEach(() => {
			vi.resetAllMocks()
			mockStore.currentItem = vi.fn(() => ({ index: [0] }))
		})
		afterAll(() => {
			instance.destroy()
		})

		it('should not trigger any action', async () => {
			await fireEvent.click(root)
			await fireEvent.click(root, { shiftKey: true })
			await fireEvent.click(root, { ctrlKey: true })
			await fireEvent.click(root, { metaKey: true })
			expect(mockStore.select).not.toHaveBeenCalled()
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			expect(mockStore.toggleSelection).not.toHaveBeenCalled()
			expect(mockStore.toggleExpansion).not.toHaveBeenCalled()
			await fireEvent.dragStart(root)
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			await fireEvent.dragOver(root)
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.drop(root)
			expect(mockStore.dropOver).not.toHaveBeenCalled()
		})
		it.each(nodes)('should not trigger drag/drop actions', async (node) => {
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			await fireEvent.dragOver(node)
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.drop(node)
			expect(mockStore.dropOver).not.toHaveBeenCalled()
			// await fireEvent.dragEnd(node)
			// expect(mockStore.dragEnd).not.toHaveBeenCalled()
		})
		it.each(nodes)('should trigger selectRange on node shift+click', async (node) => {
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node, { shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(indices)
		})
		it.each(texts)('should trigger select on content shift+click', async (node) => {
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node, { shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(indices)
		})

		it.each(nodes)('should trigger toggleSelection on node ctrl+click', async (node) => {
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node, { ctrlKey: true })
			expect(mockStore.toggleSelection).toHaveBeenCalledWith(indices)
		})
		it.each(nodes)('should trigger toggleSelection on node meta+click', async (node) => {
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node, { metaKey: true })
			expect(mockStore.toggleSelection).toHaveBeenCalledWith(indices)
		})

		it.each(texts)('should trigger toggleSelection on content ctrl+click', async (node) => {
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node, { ctrlKey: true })
			expect(mockStore.toggleSelection).toHaveBeenCalledWith(indices)
		})
		it.each(texts)('should trigger toggleSelection on content meta+click', async (node) => {
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(node, { metaKey: true })
			expect(mockStore.toggleSelection).toHaveBeenCalledWith(indices)
		})

		it.each(icons)('should trigger toggleExpansion on icon click', async (icon) => {
			const indices = icon.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(icon, { shiftKey: true })
			expect(mockStore.toggleExpansion).toHaveBeenCalledWith(indices)
			expect(mockStore.select).not.toHaveBeenCalled()
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			expect(mockStore.toggleSelection).not.toHaveBeenCalled()
		})

		it.each(icons)('should trigger toggleExpansion on icon click', async (icon) => {
			const indices = icon.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(icon, { metaKey: true })
			expect(mockStore.toggleExpansion).toHaveBeenCalledWith(indices)
			expect(mockStore.select).not.toHaveBeenCalled()
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			expect(mockStore.toggleSelection).not.toHaveBeenCalled()
		})

		it.each(icons)('should trigger toggleExpansion on icon click', async (icon) => {
			const indices = icon.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.click(icon, { metaKey: true })
			expect(mockStore.toggleExpansion).toHaveBeenCalledWith(indices)
			expect(mockStore.select).not.toHaveBeenCalled()
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			expect(mockStore.toggleSelection).not.toHaveBeenCalled()
		})
	})
})
