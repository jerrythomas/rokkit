import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { switchable } from '../src/switchable'
import { toUseHandlersFor, toOnlyTrigger, toHaveBeenDispatchedWith } from 'validators'

expect.extend({ toUseHandlersFor, toOnlyTrigger, toHaveBeenDispatchedWith })

describe('switchable', () => {
	const keys = [' ', 'Enter', 'ArrowRight', 'ArrowLeft']
	let handle = vi.fn()
	const node = document.createElement('div')

	beforeEach(() => {
		handle.mockClear()
		node.addEventListener('change', handle)
	})
	afterEach(() => {
		node.removeEventListener('change', handle)
	})

	it('should use handlers and cleanup on destroy', () => {
		const events = ['keydown', 'click']
		let data = { value: null, options: [false, true], disabled: false }
		expect(switchable).toUseHandlersFor(data, events)
	})

	it('should handle null value', async () => {
		const action = switchable(node, { value: null, options: [false, true], disabled: false })

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith(true)
		action.destroy()
	})

	it('should not switch on click when disabled', async () => {
		const action = switchable(node, { value: false, options: [false, true], disabled: true })

		await fireEvent.click(node)
		expect(handle).not.toHaveBeenCalled()

		keys.forEach(async (key) => {
			await fireEvent.keyDown(node, key)
			expect(handle).not.toHaveBeenCalled()
		})

		action.destroy()
	})

	it.each(keys)('should not change on key [%s] when disabled', async (key) => {
		const action = switchable(node, { value: false, options: [false, true], disabled: true })

		await fireEvent.keyDown(node, key)
		expect(handle).not.toHaveBeenCalled()

		action.destroy()
	})

	it('should switch between two values on click', async () => {
		const action = switchable(node, { value: false, options: [false, true], disabled: false })

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith(true)

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith(false)
		action.destroy()
	})

	it('should switch between multiple items on click', async () => {
		const action = switchable(node, { value: 'a', options: ['a', 'b', 'c'], disabled: false })

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith('b')
		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith('c')

		await fireEvent.click(node)
		expect(handle).toHaveBeenDispatchedWith('a')
		action.destroy()
	})

	it.each(keys)('should handle key [%s]', async (key) => {
		const action = switchable(node, { value: false, options: [false, true], disabled: false })

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(true)

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(false)

		action.destroy()
	})

	it.each(keys)('should handle key [%s] for multiple items', async (key) => {
		const action = switchable(node, { value: 'a', options: ['a', 'b', 'c'], disabled: false })
		handle.mockClear()

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(key === 'ArrowLeft' ? 'c' : 'b')

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith(key === 'ArrowLeft' ? 'b' : 'c')

		await fireEvent.keyDown(node, { key })
		expect(handle).toHaveBeenDispatchedWith('a')

		action.destroy()
	})
})
