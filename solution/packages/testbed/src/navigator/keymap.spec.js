import { describe, it, expect } from 'vitest'
import { ACTIONS } from '../constants.js'
import { buildKeymap, resolveAction } from './keymap.js'

// ─── ACTIONS ──────────────────────────────────────────────────────────────────

describe('ACTIONS', () => {
	it('exports all expected action names', () => {
		expect(Object.keys(ACTIONS)).toEqual([
			'next', 'prev', 'first', 'last', 'expand', 'collapse',
			'select', 'extend', 'range', 'cancel'
		])
	})

	it('is frozen (immutable)', () => {
		expect(Object.isFrozen(ACTIONS)).toBe(true)
	})
})

// ─── buildKeymap: vertical (default) ─────────────────────────────────────────

describe('buildKeymap — vertical (default)', () => {
	it('ArrowDown → next', () => {
		const km = buildKeymap()
		expect(km.plain.ArrowDown).toBe(ACTIONS.next)
	})

	it('ArrowUp → prev', () => {
		const km = buildKeymap()
		expect(km.plain.ArrowUp).toBe(ACTIONS.prev)
	})

	it('ArrowRight is not in plain map when not collapsible', () => {
		const km = buildKeymap({ collapsible: false })
		expect(km.plain.ArrowRight).toBeUndefined()
	})

	it('ArrowRight → expand when collapsible', () => {
		const km = buildKeymap({ collapsible: true })
		expect(km.plain.ArrowRight).toBe(ACTIONS.expand)
	})

	it('ArrowLeft → collapse when collapsible', () => {
		const km = buildKeymap({ collapsible: true })
		expect(km.plain.ArrowLeft).toBe(ACTIONS.collapse)
	})

	it('Enter → select', () => {
		const km = buildKeymap()
		expect(km.plain.Enter).toBe(ACTIONS.select)
	})

	it('Space → select', () => {
		const km = buildKeymap()
		expect(km.plain[' ']).toBe(ACTIONS.select)
	})

	it('Home → first', () => {
		const km = buildKeymap()
		expect(km.plain.Home).toBe(ACTIONS.first)
	})

	it('End → last', () => {
		const km = buildKeymap()
		expect(km.plain.End).toBe(ACTIONS.last)
	})

	it('Escape → cancel', () => {
		const km = buildKeymap()
		expect(km.plain.Escape).toBe(ACTIONS.cancel)
	})

	it('Shift+Space → range', () => {
		const km = buildKeymap()
		expect(km.shift[' ']).toBe(ACTIONS.range)
	})

	it('Ctrl+Space → extend', () => {
		const km = buildKeymap()
		expect(km.ctrl[' ']).toBe(ACTIONS.extend)
	})

	it('Ctrl+Home → first', () => {
		const km = buildKeymap()
		expect(km.ctrl.Home).toBe(ACTIONS.first)
	})

	it('Ctrl+End → last', () => {
		const km = buildKeymap()
		expect(km.ctrl.End).toBe(ACTIONS.last)
	})
})

// ─── buildKeymap: vertical rtl ────────────────────────────────────────────────

describe('buildKeymap — vertical rtl', () => {
	it('ArrowDown → next (same as ltr)', () => {
		const km = buildKeymap({ orientation: 'vertical', dir: 'rtl' })
		expect(km.plain.ArrowDown).toBe(ACTIONS.next)
	})

	it('ArrowUp → prev (same as ltr)', () => {
		const km = buildKeymap({ orientation: 'vertical', dir: 'rtl' })
		expect(km.plain.ArrowUp).toBe(ACTIONS.prev)
	})

	it('ArrowLeft → expand when collapsible (reversed from ltr)', () => {
		const km = buildKeymap({ orientation: 'vertical', dir: 'rtl', collapsible: true })
		expect(km.plain.ArrowLeft).toBe(ACTIONS.expand)
	})

	it('ArrowRight → collapse when collapsible (reversed from ltr)', () => {
		const km = buildKeymap({ orientation: 'vertical', dir: 'rtl', collapsible: true })
		expect(km.plain.ArrowRight).toBe(ACTIONS.collapse)
	})

	it('ArrowLeft is not in plain map when not collapsible', () => {
		const km = buildKeymap({ orientation: 'vertical', dir: 'rtl', collapsible: false })
		expect(km.plain.ArrowLeft).toBeUndefined()
	})
})

// ─── buildKeymap: horizontal ──────────────────────────────────────────────────

describe('buildKeymap — horizontal', () => {
	it('ArrowRight → next', () => {
		const km = buildKeymap({ orientation: 'horizontal' })
		expect(km.plain.ArrowRight).toBe(ACTIONS.next)
	})

	it('ArrowLeft → prev', () => {
		const km = buildKeymap({ orientation: 'horizontal' })
		expect(km.plain.ArrowLeft).toBe(ACTIONS.prev)
	})

	it('ArrowDown → expand when collapsible', () => {
		const km = buildKeymap({ orientation: 'horizontal', collapsible: true })
		expect(km.plain.ArrowDown).toBe(ACTIONS.expand)
	})

	it('ArrowUp → collapse when collapsible', () => {
		const km = buildKeymap({ orientation: 'horizontal', collapsible: true })
		expect(km.plain.ArrowUp).toBe(ACTIONS.collapse)
	})

	it('dir param has no effect (RTL handled via CSS flex-reverse)', () => {
		const ltr = buildKeymap({ orientation: 'horizontal', dir: 'ltr' })
		const rtl = buildKeymap({ orientation: 'horizontal', dir: 'rtl' })
		expect(ltr.plain).toEqual(rtl.plain)
		expect(ltr.shift).toEqual(rtl.shift)
		expect(ltr.ctrl).toEqual(rtl.ctrl)
	})
})

// ─── resolveAction ────────────────────────────────────────────────────────────

function makeEvent(key, modifiers = {}) {
	return { key, shiftKey: false, ctrlKey: false, metaKey: false, ...modifiers }
}

describe('resolveAction', () => {
	it('returns plain action for unmodified key', () => {
		const km = buildKeymap()
		expect(resolveAction(makeEvent('ArrowDown'), km)).toBe(ACTIONS.next)
	})

	it('returns shift action for Shift+key', () => {
		const km = buildKeymap()
		expect(resolveAction(makeEvent(' ', { shiftKey: true }), km)).toBe(ACTIONS.range)
	})

	it('returns ctrl action for Ctrl+key', () => {
		const km = buildKeymap()
		expect(resolveAction(makeEvent(' ', { ctrlKey: true }), km)).toBe(ACTIONS.extend)
	})

	it('returns ctrl action for Meta+key (macOS)', () => {
		const km = buildKeymap()
		expect(resolveAction(makeEvent(' ', { metaKey: true }), km)).toBe(ACTIONS.extend)
	})

	it('returns null for Shift + unknown key (no binding in shift map)', () => {
		const km = buildKeymap()
		// ArrowDown has no shift binding
		expect(resolveAction(makeEvent('ArrowDown', { shiftKey: true }), km)).toBeNull()
	})

	it('returns null for Ctrl + unknown key (no binding in ctrl map)', () => {
		const km = buildKeymap()
		// ArrowDown has no ctrl binding
		expect(resolveAction(makeEvent('ArrowDown', { ctrlKey: true }), km)).toBeNull()
	})

	it('returns null for unknown plain key', () => {
		const km = buildKeymap()
		expect(resolveAction(makeEvent('Tab'), km)).toBeNull()
	})

	it('Shift takes precedence over Ctrl when both are held (edge case)', () => {
		// shiftKey=true, ctrlKey=true — falls into ctrlKey branch (shift+ctrl combo)
		const km = buildKeymap()
		const result = resolveAction(makeEvent(' ', { shiftKey: true, ctrlKey: true }), km)
		expect(result).toBe(ACTIONS.extend)
	})
})
