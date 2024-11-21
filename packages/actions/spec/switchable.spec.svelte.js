import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { switchable } from '../src/switchable.svelte'
import { flushSync } from 'svelte'
import { toUseHandlersFor, toOnlyTrigger, toHaveBeenDispatchedWith } from 'validators'

expect.extend({ toUseHandlersFor, toOnlyTrigger, toHaveBeenDispatchedWith })

describe('switchable', () => {
	const keys = [' ', 'Enter', 'ArrowRight', 'ArrowLeft']
	const handle = vi.fn()
	const node = document.createElement('div')
	const events = ['keydown', 'click']

	beforeEach(() => {
		handle.mockClear()
		node.addEventListener('change', handle)
	})
	afterEach(() => {
		node.removeEventListener('change', handle)
	})

	// it('should use handlers and cleanup on destroy', () => {
	// 	const events = ['keydown', 'click']
	//
	// 	expect(switchable).toUseHandlersFor(data, events)
	// })
	it('should cleanup events on destroy', () => {
		const addEventSpy = vi.spyOn(node, 'addEventListener')
		const removeEventSpy = vi.spyOn(node, 'removeEventListener')
		const data = $state({ value: null, options: [false, true], disabled: false })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()
		events.forEach((event) => {
			expect(addEventSpy).toHaveBeenCalledWith(event, expect.any(Function), {})
		})
		cleanup()
		events.forEach((event) => {
			expect(removeEventSpy).toHaveBeenCalledWith(event, expect.any(Function), {})
		})
	})
	it('should not register events when disabled', () => {
		const addEventSpy = vi.spyOn(node, 'addEventListener')
		const removeEventSpy = vi.spyOn(node, 'removeEventListener')
		const data = $state({ value: null, options: [false, true], disabled: true })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()

		expect(addEventSpy).not.toHaveBeenCalled()

		cleanup()
		expect(removeEventSpy).not.toHaveBeenCalled()
	})

	it('should handle null value', async () => {
		const data = $state({ value: null, options: [false, true], disabled: false })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith(true)
		cleanup()
	})

	it('should not switch on click when disabled', async () => {
		const data = $state({ value: false, options: [false, true], disabled: true })
		const cleanup = $effect.root(() => switchable(node, data))

		await fireEvent.click(node)
		expect(handle).not.toHaveBeenCalled()

		keys.forEach(async (key) => {
			await fireEvent.keyDown(node, key)
			expect(handle).not.toHaveBeenCalled()
		})

		cleanup()
	})

	it.each(keys)('should not change on key [%s] when disabled', async (key) => {
		const data = $state({ value: false, options: [false, true], disabled: true })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()

		await fireEvent.keyDown(node, key)
		expect(handle).not.toHaveBeenCalled()

		cleanup()
	})

	it('should switch between two values on click', async () => {
		const data = $state({ value: false, options: [false, true], disabled: false })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith(true)

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith(false)
		cleanup()
	})

	it('should switch between multiple items on click', async () => {
		const data = $state({ value: 'a', options: ['a', 'b', 'c'], disabled: false })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith('b')
		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith('c')

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith('a')
		cleanup()
	})

	it.each(keys)('should handle key [%s]', async (key) => {
		const data = $state({ value: false, options: [false, true], disabled: false })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(true)

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(false)

		cleanup()
	})

	it.each(keys)('should handle key [%s] for multiple items', async (key) => {
		const data = $state({ value: 'a', options: ['a', 'b', 'c'], disabled: false })
		const cleanup = $effect.root(() => switchable(node, data))
		flushSync()
		handle.mockClear()

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(key === 'ArrowLeft' ? 'c' : 'b')

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(key === 'ArrowLeft' ? 'b' : 'c')

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith('a')

		cleanup()
	})
})
