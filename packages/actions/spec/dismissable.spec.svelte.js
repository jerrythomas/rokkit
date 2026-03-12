import { vi, it, expect, describe, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { dismissable } from '../src/dismissable.svelte.js'

describe('dismissable', () => {
	let node = null
	let dismissSpy = null

	beforeEach(() => {
		node = document.createElement('div')
		dismissSpy = vi.fn()
		node.addEventListener('dismiss', dismissSpy)
	})

	afterEach(() => {
		node.removeEventListener('dismiss', dismissSpy)
		vi.resetAllMocks()
	})

	it('should dispatch "dismiss" event when clicking outside the node', () => {
		const cleanup = $effect.root(() => dismissable(node))
		flushSync()

		document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(dismissSpy).toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch "dismiss" event when pressing the ESC key', () => {
		const cleanup = $effect.root(() => dismissable(node))
		flushSync()

		const keyupEvent = new KeyboardEvent('keyup', { keyCode: 27 })
		document.dispatchEvent(keyupEvent)
		expect(dismissSpy).toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch "dismiss" event when pressing the Escape key', () => {
		const cleanup = $effect.root(() => dismissable(node))
		flushSync()

		const keyupEvent = new KeyboardEvent('keyup', { key: 'Escape' })
		document.dispatchEvent(keyupEvent)
		expect(dismissSpy).toHaveBeenCalled()

		cleanup()
	})

	it('should not dispatch "dismiss" event when other key is pressed', () => {
		const cleanup = $effect.root(() => dismissable(node))
		flushSync()

		const keyupEvent = new KeyboardEvent('keyup', { keyCode: 64 })
		document.dispatchEvent(keyupEvent)
		expect(dismissSpy).not.toHaveBeenCalled()

		cleanup()
	})

	it('should not dispatch "dismiss" event when clicking inside the node', () => {
		const cleanup = $effect.root(() => dismissable(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(dismissSpy).not.toHaveBeenCalled()

		cleanup()
	})

	it('should not dispatch "dismiss" event when clicking inside the node with defaultPrevented', () => {
		const cleanup = $effect.root(() => dismissable(node))
		flushSync()

		const insideNode = document.createElement('div')
		node.appendChild(insideNode)
		node.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		insideNode.dispatchEvent(new MouseEvent('click', { bubbles: true }))

		expect(dismissSpy).not.toHaveBeenCalled()
		cleanup()
	})

	it('should add and remove click and keyup handlers to document', () => {
		const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
		const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

		const cleanup = $effect.root(() => dismissable(node))

		flushSync()
		cleanup()
		expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(1, 'click', expect.any(Function), {})
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(2, 'keyup', expect.any(Function), {})

		expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(1, 'click', expect.any(Function), {})
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(2, 'keyup', expect.any(Function), {})

		addEventListenerSpy.mockRestore()
		removeEventListenerSpy.mockRestore()
	})
})
