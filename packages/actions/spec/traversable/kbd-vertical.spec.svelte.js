import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import { traversable } from '../../src/traversable.svelte'
import { mockStore } from '../mocks/store'
import { createTree } from '../mocks/tree'

describe('traversable', () => {
	describe('vertical', () => {
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
		const mockCurrentNode = root.querySelector('[data-index="0-0"]')

		const config = $state({ store: mockStore })
		const cleanup = $effect.root(() => traversable(root, config))
		flushSync()

		beforeEach(() => {
			vi.clearAllMocks()
			mockStore.currentItem = vi.fn(() => ({ indexPath: [0, 0] }))
		})
		afterAll(() => {
			cleanup()
		})

		it('should trigger moveByOffset on ArrowDown', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowDown' })
			expect(mockStore.moveByOffset).toHaveBeenCalledWith(1)
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalledWith({
				behavior: 'smooth',
				block: 'nearest'
			})
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger moveByOffset on ArrowUp', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowUp' })
			expect(mockStore.moveByOffset).toHaveBeenCalledWith(-1)
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalled()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger collapse on ArrowLeft', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowLeft' })
			expect(mockStore.collapse).toHaveBeenCalledWith()
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalled()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger expand on ArrowRight', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowRight' })
			expect(mockStore.expand).toHaveBeenCalledWith()
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalled()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger select on Enter', async () => {
			await fireEvent.keyDown(root, { key: 'Enter' })
			expect(mockStore.select).toHaveBeenCalledWith()
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalled()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger select on Space', async () => {
			await fireEvent.keyDown(root, { key: ' ' })
			expect(mockStore.select).toHaveBeenCalledWith()
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalled()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger escape on Escape', async () => {
			await fireEvent.keyDown(root, { key: 'Escape' })
			expect(mockStore.escape).toHaveBeenCalledWith()
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalled()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger moveFirst on Home', async () => {
			await fireEvent.keyDown(root, { key: 'Home' })
			expect(mockStore.moveFirst).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger moveLast on End', async () => {
			await fireEvent.keyDown(root, { key: 'End' })
			expect(mockStore.moveLast).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger moveByOffset on PageUp', async () => {
			await fireEvent.keyDown(root, { key: 'PageUp' })
			expect(mockStore.moveByOffset).toHaveBeenCalledWith(-10)
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger moveByOffset on PageDown', async () => {
			await fireEvent.keyDown(root, { key: 'PageDown' })
			expect(mockStore.moveByOffset).toHaveBeenCalledWith(10)
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger moveFirst on ctrl+ArrowUp', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowUp', ctrlKey: true })
			expect(mockStore.moveFirst).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger moveLast on ctrl+ArrowDown', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowDown', ctrlKey: true })
			expect(mockStore.moveLast).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalled()
		})
		it('should trigger selectAll on ctrl+A, meta+A', async () => {
			await fireEvent.keyDown(root, { key: 'a', ctrlKey: true })
			expect(mockStore.selectAll).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'A', ctrlKey: true })
			expect(mockStore.selectAll).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'a', metaKey: true })
			expect(mockStore.selectAll).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'A', metaKey: true })
			expect(mockStore.selectAll).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger selectNone on ctrl+D, meta+D', async () => {
			await fireEvent.keyDown(root, { key: 'd', ctrlKey: true })
			expect(mockStore.selectNone).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'D', ctrlKey: true })
			expect(mockStore.selectNone).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'd', metaKey: true })
			expect(mockStore.selectNone).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'D', metaKey: true })
			expect(mockStore.selectNone).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger selectInvert on ctrl+I, meta+I', async () => {
			await fireEvent.keyDown(root, { key: 'i', ctrlKey: true })
			expect(mockStore.selectInvert).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'I', ctrlKey: true })
			expect(mockStore.selectInvert).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'i', metaKey: true })
			expect(mockStore.selectInvert).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'I', metaKey: true })
			expect(mockStore.selectInvert).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger cut on ctrl+X, meta+X', async () => {
			await fireEvent.keyDown(root, { key: 'x', ctrlKey: true })
			expect(mockStore.cut).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'X', ctrlKey: true })
			expect(mockStore.cut).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'x', metaKey: true })
			expect(mockStore.cut).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'X', metaKey: true })
			expect(mockStore.cut).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger copy on ctrl+C, meta+C', async () => {
			await fireEvent.keyDown(root, { key: 'c', ctrlKey: true })
			expect(mockStore.copy).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'C', ctrlKey: true })
			expect(mockStore.copy).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'c', metaKey: true })
			expect(mockStore.copy).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'C', metaKey: true })
			expect(mockStore.copy).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger paste on ctrl+V, meta+V', async () => {
			await fireEvent.keyDown(root, { key: 'v', ctrlKey: true })
			expect(mockStore.paste).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'V', ctrlKey: true })
			expect(mockStore.paste).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'v', metaKey: true })
			expect(mockStore.paste).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'V', metaKey: true })
			expect(mockStore.paste).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger undo on ctrl+Z, meta+Z', async () => {
			await fireEvent.keyDown(root, { key: 'z', ctrlKey: true })
			expect(mockStore.undo).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'Z', ctrlKey: true })
			expect(mockStore.undo).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'z', metaKey: true })
			expect(mockStore.undo).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'Z', metaKey: true })
			expect(mockStore.undo).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger redo on ctrl+Y, meta+Y', async () => {
			await fireEvent.keyDown(root, { key: 'y', ctrlKey: true })
			expect(mockStore.redo).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'Y', ctrlKey: true })
			expect(mockStore.redo).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'y', metaKey: true })
			expect(mockStore.redo).toHaveBeenCalledWith()
			await fireEvent.keyDown(root, { key: 'Y', metaKey: true })
			expect(mockStore.redo).toHaveBeenCalledWith()
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should trigger selectRange', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowDown', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(1)
			await fireEvent.keyDown(root, { key: 'ArrowUp', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(-1)
			await fireEvent.keyDown(root, { key: 'Home', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(-Infinity)
			await fireEvent.keyDown(root, { key: 'End', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(Infinity)
			// expect(mockStore.getEvents).toHaveBeenCalledTimes(4)
		})
		it('should not trigger selectRange', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowRight', shiftKey: true })
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			await fireEvent.keyDown(root, { key: 'ArrowLeft', shiftKey: true })
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			// expect(mockStore.getEvents).not.toHaveBeenCalled()
		})
	})
})
