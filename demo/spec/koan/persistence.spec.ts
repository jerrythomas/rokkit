import { describe, it, expect, beforeEach } from 'vitest'
import { read, write, clear } from '../../src/lib/koan/persistence'

describe('persistence', () => {
	beforeEach(() => localStorage.clear())

	it('writes and reads JSON values', () => {
		write('koan.test', { foo: 1 })
		expect(read('koan.test', (v: any) => typeof v?.foo === 'number')).toEqual({ foo: 1 })
	})

	it('returns null for missing key', () => {
		expect(read('koan.missing', () => true)).toBeNull()
	})

	it('returns null when schema check fails', () => {
		localStorage.setItem('koan.bad', JSON.stringify({ bogus: true }))
		expect(read('koan.bad', (v: any) => typeof v?.foo === 'number')).toBeNull()
	})

	it('returns null on malformed JSON', () => {
		localStorage.setItem('koan.broken', 'not-json{{{')
		expect(read('koan.broken', () => true)).toBeNull()
	})

	it('clears a key', () => {
		write('koan.test', 1)
		clear('koan.test')
		expect(localStorage.getItem('koan.test')).toBeNull()
	})

	it('handles SSR (no localStorage)', () => {
		const original = globalThis.localStorage
		// @ts-expect-error simulate SSR
		delete globalThis.localStorage
		expect(read('koan.x', () => true)).toBeNull()
		write('koan.x', 1) // should not throw
		clear('koan.x')    // should not throw
		globalThis.localStorage = original
	})
})
