import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Typeahead } from '../../src/navigator/typeahead.js'
import { TYPEAHEAD_RESET_MS } from '../../src/nav-constants.js'

const key = (k, mods = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, ...mods })

describe('Typeahead.accepts', () => {
	const t = new Typeahead()
	it('takes single printable characters, shift allowed', () => {
		expect(t.accepts(key('a'))).toBe(true)
		expect(t.accepts(key('A', { shiftKey: true }))).toBe(true)
	})
	it('refuses modified keys, named keys and space', () => {
		expect(t.accepts(key('a', { ctrlKey: true }))).toBe(false)
		expect(t.accepts(key('a', { metaKey: true }))).toBe(false)
		expect(t.accepts(key('a', { altKey: true }))).toBe(false)
		expect(t.accepts(key('ArrowDown'))).toBe(false)
		expect(t.accepts(key(' '))).toBe(false)
	})
})

describe('Typeahead.type', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('accumulates into one search, starting after the focused item on the first key only', () => {
		const find = vi.fn(() => 'k')
		const t = new Typeahead()
		t.type('a', 'focused', find)
		t.type('b', 'focused', find)
		expect(find).toHaveBeenNthCalledWith(1, 'a', 'focused')
		expect(find).toHaveBeenNthCalledWith(2, 'ab', null)
	})

	it('returns the match, or null when there is none — the buffer still grows', () => {
		const t = new Typeahead()
		expect(t.type('x', null, () => null)).toBeNull()
		expect(t.type('y', null, (text) => (text === 'xy' ? 'hit' : null))).toBe('hit')
	})

	it('starts a fresh search after the inactivity timeout', () => {
		const find = vi.fn(() => null)
		const t = new Typeahead()
		t.type('a', 'f1', find)
		vi.advanceTimersByTime(TYPEAHEAD_RESET_MS - 1)
		t.type('b', 'f2', find)
		expect(find).toHaveBeenLastCalledWith('ab', null)
		vi.advanceTimersByTime(TYPEAHEAD_RESET_MS)
		t.type('c', 'f3', find)
		expect(find).toHaveBeenLastCalledWith('c', 'f3')
	})

	it('clear() drops the buffer and the pending timer', () => {
		const find = vi.fn(() => null)
		const t = new Typeahead()
		t.type('a', 'f', find)
		t.clear()
		expect(vi.getTimerCount()).toBe(0)
		t.type('b', 'g', find)
		expect(find).toHaveBeenLastCalledWith('b', 'g')
		t.clear()
		t.clear()
	})
})
