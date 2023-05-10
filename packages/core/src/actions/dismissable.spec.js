import { vi, it, expect, describe, beforeEach, afterEach } from 'vitest'
import { dismissable } from './dismissable'

describe('dismissable', () => {
	let node, action, dismissSpy

	beforeEach(() => {
		node = document.createElement('div')
		dismissSpy = vi.fn()
		node.addEventListener('dismiss', dismissSpy)
	})

	afterEach(() => {
		if (action) action.destroy()
		node.removeEventListener('dismiss', dismissSpy)
		vi.resetAllMocks()
	})

	it('dispatches "dismiss" event when clicking outside the node', () => {
		action = dismissable(node)
		document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(dismissSpy).toHaveBeenCalled()
	})

	it('dispatches "dismiss" event when pressing the ESC key', () => {
		action = dismissable(node)

		const keyupEvent = new KeyboardEvent('keyup', { keyCode: 27 })
		document.dispatchEvent(keyupEvent)

		expect(dismissSpy).toHaveBeenCalled()
	})
	it('does not dispatch "dismiss" event when other key is pressed', () => {
		action = dismissable(node)

		const keyupEvent = new KeyboardEvent('keyup', { keyCode: 64 })
		document.dispatchEvent(keyupEvent)

		expect(dismissSpy).not.toHaveBeenCalled()
	})

	it('does not dispatch "dismiss" event when clicking inside the node', () => {
		action = dismissable(node)
		node.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		// fireEvent.click(node)

		expect(dismissSpy).not.toHaveBeenCalled()
	})

	it('does not dispatch "dismiss" event when clicking inside the node with defaultPrevented', () => {
		action = dismissable(node)

		const insideNode = document.createElement('div')
		node.appendChild(insideNode)
		node.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		insideNode.dispatchEvent(new MouseEvent('click', { bubbles: true }))

		expect(dismissSpy).not.toHaveBeenCalled()
	})

	it('adds click and keyup handlers to document', () => {
		document.addEventListener = vi.fn()
		document.removeEventListener = vi.fn()
		const action = dismissable(node)
		expect(document.addEventListener).toHaveBeenCalledWith(
			'click',
			expect.any(Function),
			true
		)
		expect(document.addEventListener).toHaveBeenCalledWith(
			'keyup',
			expect.any(Function),
			true
		)
		action.destroy()
		expect(document.removeEventListener).toHaveBeenCalledWith(
			'click',
			expect.any(Function),
			true
		)
		expect(document.removeEventListener).toHaveBeenCalledWith(
			'keyup',
			expect.any(Function),
			true
		)
		vi.resetAllMocks()
	})
})
