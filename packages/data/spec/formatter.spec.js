import { describe, it, expect } from 'vitest'
import { createFormatter } from '../src/formatter'

describe('createFormatter', () => {
	it('should return the original value for default formatting', () => {
		const formatter = createFormatter('default')
		expect(formatter('hello')).toBe('hello')
		expect(formatter(123)).toBe(123)
	})

	it('should format integer numbers with no decimal places', () => {
		const formatInteger = createFormatter('integer')
		expect(formatInteger(123456)).toBe('123,456')
	})

	it('should format numbers with provided decimal places', () => {
		const formatNumber = createFormatter('number', 'en-US', 4)
		expect(formatNumber(1234.56)).toBe('1,234.5600')
	})

	it('should format dates according to the provided locale', () => {
		const formatDate = createFormatter('date', 'en-US')
		expect(formatDate(new Date('2023-01-01'))).toBe('1/1/2023')
	})

	it('should format time according to the provided locale', () => {
		const formatTime = createFormatter('time', 'en-US')
		expect(formatTime(new Date('2023-01-01T14:30:00'))).toMatch(/2:30:00 PM/)
	})

	it('should format numbers with no locales provided taking the default value', () => {
		const formatNumber = createFormatter('number')
		expect(formatNumber(1234.567)).toMatch(/1,234.57/)
	})

	it('should format currency with the provided locale and currency code', () => {
		const formatCurrency = createFormatter('currency', 'en-US', 2, 'USD')
		expect(formatCurrency(1234.5)).toBe('$1,234.50')
	})

	it('should format currency with the provided locale and currency code', () => {
		const formatCurrency = createFormatter('currency', 'en-US', 2)
		expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50')
	})

	it('should format objects', () => {
		const formatObject = createFormatter('object')
		expect(formatObject({ a: 1, b: 2 })).toBe('{"a":1,"b":2}')
	})

	it('should format arrays', () => {
		const formatArray = createFormatter('array')
		expect(formatArray([1, 2, 3])).toBe('[1,2,3]')
	})

	it('should return ellipsis', () => {
		const formatEllipsis = createFormatter('ellipsis')
		expect(formatEllipsis()).toBe('...')
	})
})
