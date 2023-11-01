import { describe, it, expect, vi, afterEach } from 'vitest'
import { delegateKeyboardEvents } from '../src/delegate'

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
		const action = delegateKeyboardEvents(element, { selector: 'span' })
		events.forEach((event) => {
			expect(element.addEventListener).toHaveBeenCalledWith(event, expect.any(Function))
		})
		action.destroy()
		events.forEach((event) => {
			expect(element.removeEventListener).toHaveBeenCalledWith(event, expect.any(Function))
		})
	})

	it('should not register a pushdown action if the element is not found', () => {
		const action = delegateKeyboardEvents(element, { selector: 'a' })
		expect(element.addEventListener).not.toHaveBeenCalled()

		action.destroy()
		expect(element.removeEventListener).not.toHaveBeenCalled()
	})

	it('should register selected events only', () => {
		const action = delegateKeyboardEvents(element, {
			selector: 'span',
			events: ['keydown']
		})
		expect(element.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
		expect(element.addEventListener).toHaveBeenCalledOnce()
		action.destroy()
		expect(element.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
		expect(element.removeEventListener).toHaveBeenCalledOnce()
	})

	it('should forward events to the child element', () => {
		const element = document.createElement('div')
		const child = document.createElement('span')
		child.dispatchEvent = vi.fn()
		element.appendChild(child)
		const action = delegateKeyboardEvents(element, { selector: 'span' })

		events.forEach((name) => {
			const event = new KeyboardEvent(name, { key: 'a' })
			element.dispatchEvent(event)
			expect(child.dispatchEvent).toHaveBeenCalledWith(event)
		})
		action.destroy()
	})
})
