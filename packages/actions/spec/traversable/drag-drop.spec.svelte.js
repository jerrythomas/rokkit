import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { traversable } from '../../src/traversable.svelte'
import { mockStore } from '../mocks/store'
import { createTree } from '../mocks/tree'
import { flushSync } from 'svelte'

describe('traversable', () => {
	const items = [
		{
			text: 'smith',
			indexPath: [0],
			children: [
				{ text: 'john', indexPath: [0, 0] },
				{ text: 'jane', indexPath: [0, 1] }
			]
		},
		{
			text: 'hunt',
			indexPath: [0],
			children: [
				{ text: 'ethan', indexPath: [1, 0] },
				{ text: 'emily', indexPath: [1, 1] }
			]
		}
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
			const config = $state({ store: mockStore, options: { allowDrag: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()
			await fireEvent.dragStart(root)
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			await fireEvent.dragOver(nodes[0])
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.drop(nodes[0])
			expect(mockStore.dropOver).not.toHaveBeenCalled()
			cleanup()
		})

		it.each(nodes)('should trigger dragStart on node drag', async (node) => {
			const config = $state({ store: mockStore, options: { allowDrag: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).toHaveBeenCalledWith(indices)
			cleanup()
		})
		it.each(texts)('should trigger dragStart on content drag', async (node) => {
			const config = $state({ store: mockStore, options: { allowDrag: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragStart(node)
			expect(mockStore.dragStart).toHaveBeenCalledWith(indices)
			cleanup()
		})
	})
	describe('drag over', () => {
		beforeEach(() => {
			vi.resetAllMocks()
		})

		it('should not trigger any action', async () => {
			const config = $state({ store: mockStore, options: { allowDrop: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()
			await fireEvent.dragOver(root)
			expect(mockStore.dragOver).not.toHaveBeenCalled()
			await fireEvent.dragStart(nodes[0])
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			cleanup()
		})

		it.each(nodes)('should trigger dragOver on node drag', async (node) => {
			const config = $state({ store: mockStore, options: { allowDrop: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragOver(node)
			expect(mockStore.dragOver).toHaveBeenCalledWith(indices)
			cleanup()
		})

		it.each(texts)('should trigger dragOver on content drag', async (node) => {
			const config = $state({ store: mockStore, options: { allowDrop: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()
			const indices = node.parentNode.getAttribute('data-index').split('-').map(Number)
			await fireEvent.dragOver(node)
			expect(mockStore.dragOver).toHaveBeenCalledWith(indices)
			cleanup()
		})
	})

	describe('drop', () => {
		beforeEach(() => {
			vi.resetAllMocks()
		})
		it('should not trigger any action', async () => {
			const config = $state({ store: mockStore, options: { allowDrop: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()

			await fireEvent.drop(root)
			expect(mockStore.dropOver).not.toHaveBeenCalled()
			await fireEvent.dragStart(nodes[0])
			expect(mockStore.dragStart).not.toHaveBeenCalled()
			cleanup()
		})

		it.each(nodes)('should trigger drop on node drag', async (node) => {
			const config = $state({ store: mockStore, options: { allowDrop: true } })
			const cleanup = $effect.root(() => traversable(root, config))
			flushSync()
			const indices = node.getAttribute('data-index').split('-').map(Number)
			await fireEvent.drop(node)
			expect(mockStore.dropOver).toHaveBeenCalledWith(indices)
			cleanup()
		})
	})
})
