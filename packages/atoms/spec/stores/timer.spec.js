import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest'
import { timer, elapsed } from '../../src/stores/timer'
import { get } from 'svelte/store'

describe('Timer', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should initialize elapsed with zero', () => {
		let value = get(elapsed)
		expect(value).toBe(0)
	})

	it('should set elapsed using set and reset', () => {
		expect(typeof window).toBe('object')
		expect(get(elapsed)).toBe(0)

		timer.set(20)
		expect(get(elapsed)).toBe(20)

		timer.reset()
		expect(get(elapsed)).toBe(0)
	})

	it('should change elapsed time using start and stop', async () => {
		let initial = get(elapsed)
		timer.start()

		vi.advanceTimersByTime(1000)
		let value = get(elapsed)
		expect(value).toBeGreaterThan(initial)
		let previous = value

		vi.advanceTimersByTime(1000)
		value = get(elapsed)
		expect(value).toBeGreaterThan(previous)

		timer.stop()
		vi.advanceTimersByTime(1000)
		expect(get(elapsed)).toBe(value)
	})

	it('should change elapsed time using toggle', async () => {
		let initial = get(elapsed)
		timer.toggle()
		vi.advanceTimersByTime(1000)
		let value = get(elapsed)
		expect(value).toBeGreaterThan(initial)

		timer.toggle()
		vi.advanceTimersByTime(1000)
		expect(get(elapsed)).toBe(value)
	})

	it('should not change the elapsed value when used outside browser environment', () => {
		const backup = global.window
		global.window = undefined

		const initialValue = get(elapsed)

		timer.start()
		vi.advanceTimersByTime(1000)
		expect(get(elapsed)).toBe(initialValue)

		timer.stop()
		vi.advanceTimersByTime(1000)
		expect(get(elapsed)).toBe(initialValue)

		global.window = backup // restore window
	})
})
