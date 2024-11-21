import { describe, it, expect, vi, afterEach } from 'vitest'
import { delegateKeyboardEvents } from '../src/delegate.svelte.js'
import { flushSync } from 'svelte'

describe('delegateKeyboardEvents', () => {
	const element = document.createElement('div')
	const child = document.createElement('span')

	child.dispatchEvent = vi.fn()
	element.appendChild(child)
	element.addEventListener = vi.fn()
	element.removeEventListener = vi.fn()

	const events = ['keydown', 'keypress', 'keyup']

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should register a pushdown action', () => {
		const cleanup = $effect.root(() => delegateKeyboardEvents(element, { selector: 'span' }))
		flushSync()
		events.forEach((event) => {
			expect(element.addEventListener).toHaveBeenCalledWith(event, expect.any(Function), {})
		})
		cleanup()
		events.forEach((event) => {
			expect(element.removeEventListener).toHaveBeenCalledWith(event, expect.any(Function), {})
		})
	})

	it('should not register a pushdown action if the element is not found', () => {
		const cleanup = $effect.root(() => delegateKeyboardEvents(element, { selector: 'a' }))
		flushSync()
		expect(element.addEventListener).not.toHaveBeenCalled()
		cleanup()
		expect(element.removeEventListener).not.toHaveBeenCalled()
	})

	it('should register selected events only', () => {
		const cleanup = $effect.root(() =>
			delegateKeyboardEvents(element, {
				selector: 'span',
				events: ['keydown']
			})
		)
		flushSync()
		expect(element.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), {})
		expect(element.addEventListener).toHaveBeenCalledOnce()
		cleanup()
		expect(element.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), {})
		expect(element.removeEventListener).toHaveBeenCalledOnce()
	})

	it('should forward events to the child element', () => {
		const element = document.createElement('div')
		const child = document.createElement('span')
		child.dispatchEvent = vi.fn()
		element.appendChild(child)

		const cleanup = $effect.root(() => delegateKeyboardEvents(element, { selector: 'span' }))
		flushSync()
		events.forEach((name) => {
			const event = new KeyboardEvent(name, { key: 'a' })
			element.dispatchEvent(event)
			expect(child.dispatchEvent).toHaveBeenCalledWith(event)
		})
		cleanup()
	})
})
