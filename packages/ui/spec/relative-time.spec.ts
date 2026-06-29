import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatRelativeTime } from '../src/utils/relative-time'

afterEach(() => vi.useRealTimers())

describe('formatRelativeTime', () => {
	it('returns "" for an invalid/empty timestamp', () => {
		expect(formatRelativeTime('')).toBe('')
		expect(formatRelativeTime('not-a-date')).toBe('')
	})
	it('formats minutes/hours/days relative to now', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
		expect(formatRelativeTime('2026-01-01T11:59:40Z')).toBe('just now')
		expect(formatRelativeTime('2026-01-01T11:55:00Z')).toBe('5m ago')
		expect(formatRelativeTime('2026-01-01T09:00:00Z')).toBe('3h ago')
		expect(formatRelativeTime('2025-12-30T12:00:00Z')).toBe('2d ago')
	})
	it('returns a clock time when relative=false', () => {
		const out = formatRelativeTime('2026-01-01T12:00:00Z', false)
		expect(out).not.toBe('')
		expect(out).not.toMatch(/ago|just now/)
	})
})
