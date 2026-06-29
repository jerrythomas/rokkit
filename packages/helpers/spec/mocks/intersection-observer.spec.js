import { describe, it, expect, vi } from 'vitest'
import { IntersectionObserver } from '../../src/mocks/intersection-observer'

describe('IntersectionObserver mock', () => {
	it('constructs with a callback and stores options', () => {
		const cb = vi.fn()
		const opts = { threshold: 0.5 }
		const io = new IntersectionObserver(cb, opts)
		expect(io.callback).toBe(cb)
		expect(io.options).toEqual(opts)
		expect(io.elements.size).toBe(0)
	})

	it('observe adds an element to the tracked set', () => {
		const io = new IntersectionObserver(vi.fn())
		const el = document.createElement('div')
		io.observe(el)
		expect(io.elements.has(el)).toBe(true)
	})

	it('unobserve removes the element from the tracked set', () => {
		const io = new IntersectionObserver(vi.fn())
		const el = document.createElement('div')
		io.observe(el)
		io.unobserve(el)
		expect(io.elements.has(el)).toBe(false)
	})

	it('disconnect clears all observed elements', () => {
		const io = new IntersectionObserver(vi.fn())
		const a = document.createElement('div')
		const b = document.createElement('span')
		io.observe(a)
		io.observe(b)
		io.disconnect()
		expect(io.elements.size).toBe(0)
	})

	it('simulateIntersection calls the callback with entries and the observer itself', () => {
		const cb = vi.fn()
		const io = new IntersectionObserver(cb)
		const fakeEntries = [{ isIntersecting: true, target: document.createElement('div') }]
		io.simulateIntersection(fakeEntries)
		expect(cb).toHaveBeenCalledOnce()
		expect(cb).toHaveBeenCalledWith(fakeEntries, io)
	})
})
