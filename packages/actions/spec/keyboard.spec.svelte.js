import { vi, it, expect, describe, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { keyboard } from '../src/keyboard.svelte.js'
import { toHaveBeenDispatchedWith } from '@rokkit/helpers/matchers'

expect.extend({ toHaveBeenDispatchedWith })

describe('keyboard', () => {
	const node = document.createElement('div')
	const spies = {
		add: vi.fn(),
		remove: vi.fn(),
		submit: vi.fn()
	}

	const keys = ['a', 'b', 'Enter', 'Backspace']
	keys.forEach((key) => {
		const button = document.createElement('button')
		button.setAttribute('data-key', key)
		node.appendChild(button)
	})

	beforeEach(() => {
		Object.entries(spies).forEach(([event, callback]) => {
			node.addEventListener(event, callback)
		})
	})

	afterEach(() => {
		Object.entries(spies).forEach(([event, callback]) => {
			node.removeEventListener(event, callback)
		})
		vi.resetAllMocks()
	})

	it('should add and remove keyup handlers to document', () => {
		const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
		const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
		const removeEventOnNodeSpy = vi.spyOn(node, 'removeEventListener')
		const addEventOnNodeSpy = vi.spyOn(node, 'addEventListener')

		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(1, 'keyup', expect.any(Function), {})
		expect(addEventOnNodeSpy).toHaveBeenCalledTimes(1)
		expect(addEventOnNodeSpy).toHaveBeenNthCalledWith(1, 'click', expect.any(Function), {})

		cleanup()
		expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(1, 'keyup', expect.any(Function), {})
		expect(removeEventOnNodeSpy).toHaveBeenCalledTimes(1)
		expect(removeEventOnNodeSpy).toHaveBeenNthCalledWith(1, 'click', expect.any(Function), {})

		addEventListenerSpy.mockRestore()
		removeEventListenerSpy.mockRestore()
		removeEventOnNodeSpy.mockRestore()
		addEventOnNodeSpy.mockRestore()
	})

	it('should not dispatch any event when an unmapped key is pressed', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		document.dispatchEvent(new KeyboardEvent('keyup', { key: '-' }))
		expect(spies.add).not.toHaveBeenCalled()
		expect(spies.remove).not.toHaveBeenCalled()
		expect(spies.submit).not.toHaveBeenCalled()
		cleanup()
	})

	it('should dispatch "add" event when an alphabet is pressed', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }))
		expect(spies.add).toHaveBeenDispatchedWith('a')
		expect(spies.remove).not.toHaveBeenCalled()
		expect(spies.submit).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch "remove" event when delete is pressed', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Delete' }))
		expect(spies.add).not.toHaveBeenCalled()
		expect(spies.remove).toHaveBeenDispatchedWith('Delete')
		expect(spies.submit).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch "remove" event when backspace is pressed', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Backspace' }))
		expect(spies.add).not.toHaveBeenCalled()
		expect(spies.remove).toHaveBeenDispatchedWith('Backspace')
		expect(spies.submit).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch "submit" event when backspace is pressed', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
		expect(spies.add).not.toHaveBeenCalled()
		expect(spies.remove).not.toHaveBeenCalled()
		expect(spies.submit).toHaveBeenDispatchedWith('Enter')

		cleanup()
	})

	it('should dispatch "add" event when an alphabet is clicked', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		node.querySelector('[data-key="a"]').click()
		expect(spies.add).toHaveBeenDispatchedWith('a')
		expect(spies.remove).not.toHaveBeenCalled()
		expect(spies.submit).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch "remove" event when delete is clicked', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		node.querySelector('[data-key="Backspace"]').click()
		expect(spies.add).not.toHaveBeenCalled()
		expect(spies.remove).toHaveBeenDispatchedWith('Backspace')
		expect(spies.submit).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch "submit" event when enter is clicked', () => {
		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		node.querySelector('[data-key="Enter"]').click()
		expect(spies.add).not.toHaveBeenCalled()
		expect(spies.remove).not.toHaveBeenCalled()
		expect(spies.submit).toHaveBeenDispatchedWith('Enter')

		cleanup()
	})
})
