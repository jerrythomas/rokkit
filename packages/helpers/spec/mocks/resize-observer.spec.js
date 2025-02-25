import { describe, it, expect, beforeEach } from 'vitest'
import { ResizeObserver } from '../../src/mocks/resize-observer'

global.ResizeObserver = ResizeObserver

describe('ResizeObserver', () => {
	let resizeObserver = null
	let callback = null
	let element = null

	beforeEach(() => {
		callback = vi.fn()
		resizeObserver = new ResizeObserver(callback)
		element = document.createElement('div')
		document.body.appendChild(element)
	})

	it('should observe an element and trigger the callback with initial size', () => {
		resizeObserver.observe(element)

		expect(callback).toHaveBeenCalledTimes(1)
		const [entry] = callback.mock.calls[0][0]
		expect(entry.target).toBe(element)
		expect(entry.contentRect).toEqual(element.getBoundingClientRect())
	})

	it('should unobserve an element', () => {
		resizeObserver.observe(element)
		resizeObserver.unobserve(element)

		expect(resizeObserver.elements.has(element)).toBe(false)
	})

	it('should disconnect and clear all observed elements', () => {
		resizeObserver.observe(element)
		resizeObserver.disconnect()

		expect(resizeObserver.elements.size).toBe(0)
	})

	it('should simulate a resize event', () => {
		resizeObserver.observe(element)
		const newSize = { width: 500, height: 300, top: 0, left: 0, right: 500, bottom: 300 }

		resizeObserver.simulateResize(element, newSize)

		expect(callback).toHaveBeenCalledTimes(2)
		const [entry] = callback.mock.calls[1][0]
		expect(entry.target).toBe(element)
		expect(entry.contentRect).toEqual(newSize)
	})
})
