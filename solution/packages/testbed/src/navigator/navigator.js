/**
 * Navigator
 *
 * Wires DOM events on a root element to Wrapper actions.
 * Designed as a plain class so it works as a Svelte action or standalone.
 *
 * Responsibilities:
 *   - keydown   → keymap lookup → wrapper action (+ scrollIntoView)
 *   - click     → click action lookup → wrapper action
 *   - focusin   → find nearest data-path → wrapper.moveTo(path)
 *                 if no data-path found (tabbed into container) → redirect to focusedKey
 *   - focusout  → detect when focus leaves the list entirely → call wrapper.blur()
 *   - typeahead → buffer printable chars → wrapper.findByText → wrapper.moveTo
 *
 * Usage as Svelte action:
 *   use:navigator={{ wrapper, collapsible }}
 */

import { TYPEAHEAD_RESET_MS } from '../constants.js'
import { buildKeymap, resolveAction } from './keymap.js'

// ─── Click action resolution ──────────────────────────────────────────────────

/**
 * Determine the action for a mouse click based on modifiers and target.
 * Group headers marked with data-accordion-trigger dispatch 'toggle'.
 *
 * @param {MouseEvent} event
 * @returns {string}
 */
function getClickAction(event) {
	const { shiftKey, ctrlKey, metaKey, target } = event

	if (shiftKey && !ctrlKey && !metaKey) return 'range'
	if (ctrlKey || metaKey) return 'extend'
	if (target.closest('[data-accordion-trigger]')) return 'toggle'
	return 'select'
}

// ─── Path resolution ──────────────────────────────────────────────────────────

/**
 * Walk up the DOM from target to find the nearest element with data-path.
 * Returns null if none found within root.
 *
 * @param {EventTarget} target
 * @param {HTMLElement} root
 * @returns {string|null}
 */
function getPath(target, root) {
	let el = /** @type {HTMLElement|null} */ (target)
	while (el && el !== root) {
		if (el.dataset?.path !== undefined) return el.dataset.path
		el = el.parentElement
	}
	return null
}

// ─── Navigator ────────────────────────────────────────────────────────────────

export class Navigator {
	#root
	#wrapper
	#keymap

	// Typeahead state
	#buffer = ''
	#bufferTimer = null

	/**
	 * @param {HTMLElement} root
	 * @param {import('./abstract-wrapper.js').AbstractWrapper} wrapper
	 * @param {{ orientation?: string, dir?: string, collapsible?: boolean }} [options]
	 */
	constructor(root, wrapper, options = {}) {
		this.#root = root
		this.#wrapper = wrapper
		this.#keymap = buildKeymap(options)

		root.addEventListener('keydown', this.#onKeydown)
		root.addEventListener('click', this.#onClick)
		root.addEventListener('focusin', this.#onFocusin)
		root.addEventListener('focusout', this.#onFocusout)
	}

	destroy() {
		this.#root.removeEventListener('keydown', this.#onKeydown)
		this.#root.removeEventListener('click', this.#onClick)
		this.#root.removeEventListener('focusin', this.#onFocusin)
		this.#root.removeEventListener('focusout', this.#onFocusout)
		this.#clearTypeahead()
	}

	// ─── Keydown ────────────────────────────────────────────────────────────

	#onKeydown = (/** @type {KeyboardEvent} */ event) => {
		// Typeahead: single printable character (no modifiers except shift for caps)
		if (this.#tryTypeahead(event)) return

		const action = resolveAction(event, this.#keymap)
		if (!action) return

		// Links handle Enter/Space natively — browser fires a synthetic click
		if (action === 'select' && event.target.closest('a[href]')) return

		event.preventDefault()
		event.stopPropagation()

		// Resolve current path from the focused element so all actions get context
		const path = getPath(document.activeElement, this.#root)
		this.#dispatch(action, path)

		// Scroll focused item into view after keyboard navigation
		this.#syncFocus()
	}

	// ─── Click ──────────────────────────────────────────────────────────────

	#onClick = (/** @type {MouseEvent} */ event) => {
		const path = getPath(event.target, this.#root)
		if (path === null) return

		const action = getClickAction(event)

		// Links: let browser navigate naturally, still update state
		if (!event.target.closest('a[href]')) {
			event.preventDefault()
		}

		this.#dispatch(action, path)
		// No scrollIntoView — user clicked where they wanted
	}

	// ─── Focusin ────────────────────────────────────────────────────────────

	#onFocusin = (/** @type {FocusEvent} */ event) => {
		const path = getPath(event.target, this.#root)

		if (path !== null) {
			// Focused a specific item (click, programmatic focus, or tab with roving tabindex)
			this.#wrapper.moveTo(path)
			return
		}

		// Focused the container itself (user tabbed in, no roving tabindex item yet)
		// Redirect focus to the currently focused item, or first item if none
		const targetKey = this.#wrapper.focusedKey
		const selector = targetKey
			? `[data-path="${targetKey}"]`
			: '[data-path]:not([disabled])'
		const el = /** @type {HTMLElement|null} */ (this.#root.querySelector(selector))
		if (el) {
			el.focus()
			// focusin will re-fire with the item as target, handled above
		}
	}

	// ─── Focusout ───────────────────────────────────────────────────────────

	#onFocusout = (/** @type {FocusEvent} */ event) => {
		// relatedTarget is the element receiving focus next
		// If it's null or outside this root, focus left the list
		const next = /** @type {Node|null} */ (event.relatedTarget)
		if (!next || !this.#root.contains(next)) {
			// Focus left the list — wrapper can react (e.g. close a dropdown)
			this.#wrapper.blur?.()
		}
	}

	// ─── Dispatch ───────────────────────────────────────────────────────────

	/**
	 * Call wrapper[action](path) for every action.
	 * Movement methods (next/prev/first/last/expand/collapse) ignore the path.
	 * Selection methods (select/extend/range/toggle) use it.
	 * If path is null for a selection action the wrapper falls back to focusedKey.
	 *
	 * @param {string} action
	 * @param {string|null} path
	 */
	#dispatch(action, path) {
		this.#wrapper[action]?.(path)
	}

	// ─── Focus + scroll ──────────────────────────────────────────────────────

	#syncFocus() {
		const key = this.#wrapper.focusedKey
		if (!key) return
		const el = /** @type {HTMLElement|null} */ (this.#root.querySelector(`[data-path="${key}"]`))
		if (!el) return
		if (el !== document.activeElement) el.focus()
		el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
	}

	// ─── Typeahead ───────────────────────────────────────────────────────────

	/**
	 * Handle printable character keys for typeahead search.
	 * Returns true if the event was consumed.
	 *
	 * @param {KeyboardEvent} event
	 * @returns {boolean}
	 */
	#tryTypeahead(event) {
		const { key, ctrlKey, metaKey, altKey } = event

		// Only single printable characters, no modifier combos
		if (ctrlKey || metaKey || altKey) return false
		if (key.length !== 1) return false
		if (key === ' ') return false // Space is a keymap action, not typeahead

		const startAfter = this.#buffer.length === 0 ? this.#wrapper.focusedKey : null
		this.#buffer += key

		// Cancel the existing reset timer but keep the accumulated buffer
		if (this.#bufferTimer) {
			clearTimeout(this.#bufferTimer)
			this.#bufferTimer = null
		}
		this.#bufferTimer = setTimeout(() => this.#clearTypeahead(), TYPEAHEAD_RESET_MS)

		const matchKey = this.#wrapper.findByText(this.#buffer, startAfter)
		if (matchKey !== null) {
			event.preventDefault()
			event.stopPropagation()
			this.#wrapper.moveTo(matchKey)
			this.#syncFocus()
			return true
		}

		return false
	}

	#clearTypeahead() {
		this.#buffer = ''
		if (this.#bufferTimer) {
			clearTimeout(this.#bufferTimer)
			this.#bufferTimer = null
		}
	}
}

// ─── Svelte action adapter ────────────────────────────────────────────────────

/**
 * Svelte action. Attach to the root element of a List/Tree.
 *
 *   use:navigator={{ wrapper, collapsible }}
 *
 * @param {HTMLElement} node
 * @param {{ wrapper: import('./abstract-wrapper.js').AbstractWrapper, orientation?: string, dir?: string, collapsible?: boolean }} options
 */
export function navigator(node, options) {
	const { wrapper, ...navOptions } = options
	const nav = new Navigator(node, wrapper, navOptions)
	return { destroy: () => nav.destroy() }
}
