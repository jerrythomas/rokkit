import { vi, it, expect, describe, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import { fillable } from '../src/fillable.svelte.js'
import { toHaveBeenDispatchedWith } from 'validators'

expect.extend({ toHaveBeenDispatchedWith })

describe('fillable', () => {
	let node = null,
		options = [],
		current = 0,
		check = false
	beforeEach(() => {
		node = document.createElement('div')
		node.dispatchEvent = vi.fn()
		options = [{ actualIndex: 0, value: 'Option 1' }]
		current = 0
		check = false
	})

	it('should initialize the empty fillable element with click listener', () => {
		const del = [document.createElement('del'), document.createElement('del')]

		del.forEach((d) => {
			d.addEventListener = vi.fn()
			d.removeEventListener = vi.fn()
			node.appendChild(d)
		})

		const cleanup = $effect.root(() => fillable(node, { options, current: -1, check }))
		flushSync()

		del.forEach((d, index) => {
			expect(d.classList.contains('empty')).toBe(true)
			expect(d.name).toEqual(`fill-${index}`)
			expect(d['data-index']).toEqual(index)
			expect(d.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
		})

		cleanup()
		del.forEach((d) => {
			expect(d.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
			node.removeChild(d)
		})
	})

	it('should fill the fillable element with the current option value', async () => {
		node.appendChild(document.createElement('del'))

		const data = $state({ options, current, check })
		const cleanup = $effect.root(() => fillable(node, data))
		flushSync()

		const del = node.querySelector('del')
		await fireEvent.click(del)
		await tick()
		expect(del.innerHTML).toBe('Option 1')
		expect(del.classList.contains('filled')).toBe(true)
		expect(node.dispatchEvent).toHaveBeenCalled(1)
		expect(node.dispatchEvent.mock.lastCall[0].type).toBe('fill')
		expect(node.dispatchEvent).toHaveBeenDispatchedWith({ index: 0, value: 'Option 1' })
		cleanup()
	})

	it('should clear the filled fillable element on click', () => {
		const del = document.createElement('del')

		node.appendChild(del)
		const data = $state({ options, current: -1, check })
		const cleanup = $effect.root(() => fillable(node, data))
		flushSync()

		del.dispatchEvent(new MouseEvent('click'))
		expect(del.innerHTML).toBe('Option 1')
		expect(del.classList.contains('empty')).toBe(false)
		expect(del.classList.contains('filled')).toBe(true)
		expect(node.dispatchEvent).toHaveBeenCalled(1)
		expect(node.dispatchEvent.mock.lastCall[0].type).toBe('fill')
		expect(node.dispatchEvent).toHaveBeenDispatchedWith({ index: 0, value: 'Option 1' })

		del.dispatchEvent(new MouseEvent('click'))
		expect(del.innerHTML).toBe('?')
		expect(del.classList.contains('empty')).toBe(true)
		expect(del.classList.contains('filled')).toBe(false)
		expect(node.dispatchEvent).toHaveBeenCalledTimes(2)
		expect(node.dispatchEvent.mock.lastCall[0].type).toBe('remove')
		expect(node.dispatchEvent).toHaveBeenDispatchedWith({ index: 0, value: 'Option 1' })
		cleanup()
	})

	it('should validate the filled values', () => {
		const del = document.createElement('del')
		node.appendChild(del)
		options = [{ actualIndex: 0, value: 'Option 1', expectedIndex: 0 }]
		const data = $state({ options, current, check: true })
		const cleanup = $effect.root(() => fillable(node, data))
		flushSync()

		del.dispatchEvent(new MouseEvent('click'))
		expect(del.innerHTML).toBe('Option 1')
		expect(del.classList.contains('empty')).toBe(false)
		expect(del.classList.contains('filled')).toBe(true)
		expect(del.classList.contains('pass')).toBe(true)

		cleanup()
	})

	it('should validate the filled values', () => {
		const del = document.createElement('del')
		node.appendChild(del)
		options = [{ actualIndex: 0, value: 'Option 1', expectedIndex: 1 }]
		const data = $state({ options, current, check: true })
		const cleanup = $effect.root(() => fillable(node, data))
		flushSync()

		del.dispatchEvent(new MouseEvent('click'))
		expect(del.innerHTML).toBe('Option 1')
		expect(del.classList.contains('fail')).toBe(true)
		cleanup()
	})
})
