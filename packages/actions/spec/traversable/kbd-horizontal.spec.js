import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { traversable } from '../../src/traversable'
import { mockStore } from '../mocks/store'
import { createTree } from '../mocks/tree'

describe('traversable', () => {
	describe('horizontal', () => {
		const items = [
			{ text: 'smith', children: [{ text: 'john' }, { text: 'jane' }] },
			{ text: 'hunt', children: [{ text: 'ethan' }, { text: 'emily' }] }
		]
		const root = createTree(items)
		document.body.appendChild(root)
		const mockCurrentNode = root.querySelector('[data-index="0-0"]')
		let instance = null
		// const instance = traversable(root, { store, options: { vertical: false, horizontal: true } })
		beforeEach(() => {
			vi.resetAllMocks()
			mockStore.currentItem = vi.fn(() => ({ index: [0, 0] }))
			instance = traversable(root, {
				store: mockStore,
				options: { vertical: false, horizontal: true }
			})
		})
		afterEach(() => {
			if (instance) instance.destroy()
		})

		it('should trigger moveDown on ArrowDown', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowDown' })
			expect(mockStore.moveDown).toHaveBeenCalledWith()
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalledWith({
				behavior: 'smooth',
				block: 'nearest'
			})
		})
		it('should trigger moveUp on ArrowUp', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowUp' })
			expect(mockStore.moveUp).toHaveBeenCalledWith()
			expect(mockCurrentNode.scrollIntoView).toHaveBeenCalled()
		})
		it('should trigger moveLeft on ArrowLeft', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowLeft' })
			expect(mockStore.moveLeft).toHaveBeenCalledWith()
		})
		it('should trigger moveRight on ArrowRight', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowRight' })
			expect(mockStore.moveRight).toHaveBeenCalledWith()
		})
		it('should trigger select on Enter', async () => {
			await fireEvent.keyDown(root, { key: 'Enter' })
			expect(mockStore.select).toHaveBeenCalledWith()
		})
		it('should trigger select on Space', async () => {
			await fireEvent.keyDown(root, { key: ' ' })
			expect(mockStore.select).toHaveBeenCalledWith()
		})
		it('should trigger escape on Escape', async () => {
			await fireEvent.keyDown(root, { key: 'Escape' })
			expect(mockStore.escape).toHaveBeenCalledWith()
		})
		it('should trigger moveFirst on Home', async () => {
			await fireEvent.keyDown(root, { key: 'Home' })
			expect(mockStore.moveFirst).toHaveBeenCalledWith()
		})
		it('should trigger moveLast on End', async () => {
			await fireEvent.keyDown(root, { key: 'End' })
			expect(mockStore.moveLast).toHaveBeenCalledWith()
		})
		it('should trigger moveUp on PageUp', async () => {
			await fireEvent.keyDown(root, { key: 'PageUp' })
			expect(mockStore.moveUp).toHaveBeenCalledWith(10)
		})
		it('should trigger moveDown on PageDown', async () => {
			await fireEvent.keyDown(root, { key: 'PageDown' })
			expect(mockStore.moveDown).toHaveBeenCalledWith(10)
		})
		it('should trigger moveFirst on ctrl+ArrowLeft', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowLeft', ctrlKey: true })
			expect(mockStore.moveFirst).toHaveBeenCalledWith()
		})
		it('should trigger moveLast on ctrl+ArrowRight', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowRight', ctrlKey: true })
			expect(mockStore.moveLast).toHaveBeenCalledWith()
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
		})
		it('should trigger selectRange', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowRight', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(1)
			await fireEvent.keyDown(root, { key: 'ArrowLeft', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(-1)
			await fireEvent.keyDown(root, { key: 'Home', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(-Infinity)
			await fireEvent.keyDown(root, { key: 'End', shiftKey: true })
			expect(mockStore.selectRange).toHaveBeenCalledWith(Infinity)
		})
		it('should not trigger selectRange', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowDown', shiftKey: true })
			expect(mockStore.selectRange).not.toHaveBeenCalled()
			await fireEvent.keyDown(root, { key: 'ArrowUp', shiftKey: true })
			expect(mockStore.selectRange).not.toHaveBeenCalled()
		})
	})
})
