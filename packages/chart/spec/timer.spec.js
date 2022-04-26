import { expect, it, vi } from 'vitest'
import { timer, elapsed } from '../src/timer'
import { getSubscribedData } from './helpers'

describe('Timer', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should initialize elapsed with zero', () => {
		let value = getSubscribedData(elapsed)
		expect(value).toBe(0)
	})

	it('should set elapsed using set and reset', () => {
		expect(typeof window).toBe('object')
		expect(getSubscribedData(elapsed)).toBe(0)

		timer.set(20)
		expect(getSubscribedData(elapsed)).toBe(20)

		timer.reset()
		expect(getSubscribedData(elapsed)).toBe(0)
	})

	it('should change elapsed time using start and stop', async () => {
		let initial = getSubscribedData(elapsed)
		timer.start()

		vi.advanceTimersByTime(1000)
		let value = getSubscribedData(elapsed)
		expect(value).toBeGreaterThan(initial)
		let previous = value

		vi.advanceTimersByTime(1000)
		value = getSubscribedData(elapsed)
		expect(value).toBeGreaterThan(previous)

		timer.stop()
		vi.advanceTimersByTime(1000)
		expect(getSubscribedData(elapsed)).toBe(value)
	})

	it('should change elapsed time using toggle', async () => {
		let initial = getSubscribedData(elapsed)
		timer.toggle()
		vi.advanceTimersByTime(1000)
		let value = getSubscribedData(elapsed)
		expect(value).toBeGreaterThan(initial)

		timer.toggle()
		vi.advanceTimersByTime(1000)
		expect(getSubscribedData(elapsed)).toBe(value)
	})

	it('should not change the elapsed value when used outside browser environment', () => {
		const backup = window
		window = undefined

		const initialValue = getSubscribedData(elapsed)

		timer.start()
		vi.advanceTimersByTime(1000)
		expect(getSubscribedData(elapsed)).toBe(initialValue)

		timer.stop()
		vi.advanceTimersByTime(1000)
		expect(getSubscribedData(elapsed)).toBe(initialValue)

		window = backup // restore window
	})
})
