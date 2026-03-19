import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { alerts } from '../src/alerts.svelte.js'

describe('AlertsStore', () => {
	afterEach(() => alerts.clear())

	describe('push()', () => {
		it('adds an alert and returns an id', () => {
			const id = alerts.push({ type: 'info', text: 'Hello' })
			expect(id).toBeTruthy()
			expect(alerts.current).toHaveLength(1)
			expect(alerts.current[0].text).toBe('Hello')
			expect(alerts.current[0].type).toBe('info')
		})

		it('defaults type to info', () => {
			alerts.push({})
			expect(alerts.current[0].type).toBe('info')
		})

		it('defaults dismissible to false', () => {
			alerts.push({ text: 'Hi' })
			expect(alerts.current[0].dismissible).toBe(false)
		})

		it('stacks multiple alerts', () => {
			alerts.push({ text: 'A' })
			alerts.push({ text: 'B' })
			alerts.push({ text: 'C' })
			expect(alerts.current).toHaveLength(3)
		})

		it('each alert has a unique id', () => {
			const a = alerts.push({ text: 'A' })
			const b = alerts.push({ text: 'B' })
			expect(a).not.toBe(b)
		})
	})

	describe('dismiss()', () => {
		it('removes the alert by id', () => {
			const id = alerts.push({ text: 'Gone' })
			alerts.dismiss(id)
			expect(alerts.current).toHaveLength(0)
		})

		it('only removes the matching alert', () => {
			alerts.push({ text: 'Keep' })
			const id = alerts.push({ text: 'Remove' })
			alerts.dismiss(id)
			expect(alerts.current).toHaveLength(1)
			expect(alerts.current[0].text).toBe('Keep')
		})

		it('is a no-op for unknown id', () => {
			alerts.push({ text: 'X' })
			alerts.dismiss('nonexistent')
			expect(alerts.current).toHaveLength(1)
		})
	})

	describe('clear()', () => {
		it('removes all alerts', () => {
			alerts.push({ text: 'A' })
			alerts.push({ text: 'B' })
			alerts.clear()
			expect(alerts.current).toHaveLength(0)
		})
	})

	describe('auto-dismiss (timeout)', () => {
		beforeEach(() => vi.useFakeTimers())
		afterEach(() => vi.useRealTimers())

		it('non-dismissible alerts default to 4000ms auto-dismiss', () => {
			alerts.push({ text: 'Auto' })
			expect(alerts.current).toHaveLength(1)
			vi.advanceTimersByTime(4000)
			expect(alerts.current).toHaveLength(0)
		})

		it('dismissible alerts default to no auto-dismiss', () => {
			alerts.push({ text: 'Persistent', dismissible: true })
			vi.advanceTimersByTime(10000)
			expect(alerts.current).toHaveLength(1)
		})

		it('auto-dismisses after explicit timeout ms', () => {
			alerts.push({ text: 'Bye', timeout: 3000 })
			expect(alerts.current).toHaveLength(1)
			vi.advanceTimersByTime(3000)
			expect(alerts.current).toHaveLength(0)
		})

		it('does not auto-dismiss when timeout is explicitly 0', () => {
			alerts.push({ text: 'Stay', timeout: 0 })
			vi.advanceTimersByTime(10000)
			expect(alerts.current).toHaveLength(1)
		})

		it('cancels timer when dismissed early', () => {
			const id = alerts.push({ text: 'Early', timeout: 5000 })
			alerts.dismiss(id)
			expect(alerts.current).toHaveLength(0)
			vi.advanceTimersByTime(5000)
			// Should not throw or add items back
			expect(alerts.current).toHaveLength(0)
		})

		it('cancels all timers on clear()', () => {
			alerts.push({ text: 'A', timeout: 1000 })
			alerts.push({ text: 'B', timeout: 2000 })
			alerts.clear()
			vi.advanceTimersByTime(5000)
			expect(alerts.current).toHaveLength(0)
		})
	})
})
