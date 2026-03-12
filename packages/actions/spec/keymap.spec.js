import { describe, it, expect } from 'vitest'
import { buildKeymap, resolveAction, ACTIONS } from '../src/keymap.js'

function makeEvent(key, { shiftKey = false, ctrlKey = false, metaKey = false } = {}) {
	return { key, shiftKey, ctrlKey, metaKey }
}

describe('buildKeymap', () => {
	describe('vertical ltr (default)', () => {
		const km = buildKeymap()

		it('ArrowDown maps to next', () => {
			expect(km.plain.ArrowDown).toBe(ACTIONS.next)
		})

		it('ArrowUp maps to prev', () => {
			expect(km.plain.ArrowUp).toBe(ACTIONS.prev)
		})

		it('Home maps to first', () => {
			expect(km.plain.Home).toBe(ACTIONS.first)
		})

		it('End maps to last', () => {
			expect(km.plain.End).toBe(ACTIONS.last)
		})

		it('Enter maps to select', () => {
			expect(km.plain.Enter).toBe(ACTIONS.select)
		})

		it('Space maps to select', () => {
			expect(km.plain[' ']).toBe(ACTIONS.select)
		})

		it('Escape maps to cancel', () => {
			expect(km.plain.Escape).toBe(ACTIONS.cancel)
		})

		it('horizontal arrows not bound when not collapsible', () => {
			expect(km.plain.ArrowLeft).toBeUndefined()
			expect(km.plain.ArrowRight).toBeUndefined()
		})
	})

	describe('vertical ltr + collapsible', () => {
		const km = buildKeymap({ orientation: 'vertical', dir: 'ltr', collapsible: true })

		it('ArrowLeft maps to collapse', () => {
			expect(km.plain.ArrowLeft).toBe(ACTIONS.collapse)
		})

		it('ArrowRight maps to expand', () => {
			expect(km.plain.ArrowRight).toBe(ACTIONS.expand)
		})
	})

	describe('vertical rtl + collapsible', () => {
		const km = buildKeymap({ orientation: 'vertical', dir: 'rtl', collapsible: true })

		it('ArrowRight maps to collapse (reversed)', () => {
			expect(km.plain.ArrowRight).toBe(ACTIONS.collapse)
		})

		it('ArrowLeft maps to expand (reversed)', () => {
			expect(km.plain.ArrowLeft).toBe(ACTIONS.expand)
		})

		it('ArrowDown still maps to next', () => {
			expect(km.plain.ArrowDown).toBe(ACTIONS.next)
		})
	})

	describe('horizontal', () => {
		const km = buildKeymap({ orientation: 'horizontal' })

		it('ArrowLeft maps to prev', () => {
			expect(km.plain.ArrowLeft).toBe(ACTIONS.prev)
		})

		it('ArrowRight maps to next', () => {
			expect(km.plain.ArrowRight).toBe(ACTIONS.next)
		})

		it('vertical arrows not in plain map', () => {
			expect(km.plain.ArrowUp).toBeUndefined()
			expect(km.plain.ArrowDown).toBeUndefined()
		})
	})

	describe('horizontal + collapsible', () => {
		const km = buildKeymap({ orientation: 'horizontal', collapsible: true })

		it('ArrowUp maps to collapse', () => {
			expect(km.plain.ArrowUp).toBe(ACTIONS.collapse)
		})

		it('ArrowDown maps to expand', () => {
			expect(km.plain.ArrowDown).toBe(ACTIONS.expand)
		})
	})

	describe('shift layer', () => {
		const km = buildKeymap()

		it('Shift+Space maps to range', () => {
			expect(km.shift[' ']).toBe(ACTIONS.range)
		})
	})

	describe('ctrl layer', () => {
		const km = buildKeymap()

		it('Ctrl+Space maps to extend', () => {
			expect(km.ctrl[' ']).toBe(ACTIONS.extend)
		})

		it('Ctrl+Home maps to first', () => {
			expect(km.ctrl.Home).toBe(ACTIONS.first)
		})

		it('Ctrl+End maps to last', () => {
			expect(km.ctrl.End).toBe(ACTIONS.last)
		})
	})
})

describe('resolveAction', () => {
	const km = buildKeymap({ orientation: 'vertical', dir: 'ltr', collapsible: true })

	it('resolves plain key', () => {
		expect(resolveAction(makeEvent('ArrowDown'), km)).toBe(ACTIONS.next)
	})

	it('resolves Shift modifier', () => {
		expect(resolveAction(makeEvent(' ', { shiftKey: true }), km)).toBe(ACTIONS.range)
	})

	it('resolves Ctrl modifier', () => {
		expect(resolveAction(makeEvent(' ', { ctrlKey: true }), km)).toBe(ACTIONS.extend)
	})

	it('resolves Meta modifier (same as Ctrl)', () => {
		expect(resolveAction(makeEvent(' ', { metaKey: true }), km)).toBe(ACTIONS.extend)
	})

	it('returns null for unbound key', () => {
		expect(resolveAction(makeEvent('Tab'), km)).toBeNull()
	})

	it('returns null for unbound shift key', () => {
		expect(resolveAction(makeEvent('ArrowDown', { shiftKey: true }), km)).toBeNull()
	})

	it('ctrl takes precedence over shift when both active', () => {
		// ctrlKey + shiftKey: ctrl layer wins
		expect(resolveAction(makeEvent(' ', { ctrlKey: true, shiftKey: true }), km)).toBe(
			ACTIONS.extend
		)
	})
})
