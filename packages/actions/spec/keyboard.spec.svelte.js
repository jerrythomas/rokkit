import { vi, it, expect, describe, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { keyboard } from '../src/keyboard.svelte.js'
import { toHaveBeenDispatchedWith } from 'validators'

expect.extend({ toHaveBeenDispatchedWith })
describe('keyboard', () => {
	const node = document.createElement('div')
	const spies = {
		add: vi.fn(),
		remove: vi.fn(),
		submit: vi.fn()
	}

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

		const cleanup = $effect.root(() => keyboard(node))
		flushSync()

		expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(1, 'keyup', expect.any(Function), {})

		cleanup()
		expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(1, 'keyup', expect.any(Function), {})

		addEventListenerSpy.mockRestore()
		removeEventListenerSpy.mockRestore()
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
})
