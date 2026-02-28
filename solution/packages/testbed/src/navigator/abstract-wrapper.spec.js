import { describe, it, expect } from 'vitest'
import { AbstractWrapper } from './abstract-wrapper.js'

// ─── AbstractWrapper base class ────────────────────────────────────────────────
//
// AbstractWrapper defines the interface the Navigator calls into.
// All methods are no-ops — subclasses (e.g. Wrapper) implement the real logic.
// Tests verify the contract: correct initial state, all methods callable,
// and correct return values from findByText.

describe('AbstractWrapper — initial state', () => {
	it('focusedKey starts as null', () => {
		const w = new AbstractWrapper()
		expect(w.focusedKey).toBeNull()
	})
})

describe('AbstractWrapper — selection actions (callable, no-op)', () => {
	it('select(path) can be called with a path', () => {
		const w = new AbstractWrapper()
		expect(() => w.select('0')).not.toThrow()
	})

	it('select(null) can be called with null', () => {
		const w = new AbstractWrapper()
		expect(() => w.select(null)).not.toThrow()
	})

	it('extend(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.extend('0')).not.toThrow()
	})

	it('range(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.range('0')).not.toThrow()
	})

	it('toggle(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.toggle('0')).not.toThrow()
	})

	it('moveTo(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.moveTo('0')).not.toThrow()
	})

	it('cancel(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.cancel('0')).not.toThrow()
	})
})

describe('AbstractWrapper — movement actions (callable, no-op)', () => {
	it('next(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.next('0')).not.toThrow()
	})

	it('prev(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.prev('0')).not.toThrow()
	})

	it('first(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.first('0')).not.toThrow()
	})

	it('last(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.last('0')).not.toThrow()
	})

	it('expand(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.expand('0')).not.toThrow()
	})

	it('collapse(path) can be called', () => {
		const w = new AbstractWrapper()
		expect(() => w.collapse('0')).not.toThrow()
	})
})

describe('AbstractWrapper — typeahead support', () => {
	it('findByText returns null (no data in base class)', () => {
		const w = new AbstractWrapper()
		expect(w.findByText('hello', null)).toBeNull()
	})

	it('findByText returns null for empty query', () => {
		const w = new AbstractWrapper()
		expect(w.findByText('', null)).toBeNull()
	})

	it('findByText returns null when startAfterKey is provided', () => {
		const w = new AbstractWrapper()
		expect(w.findByText('hello', '2')).toBeNull()
	})
})
