/**
 * Navigator
 *
 * Wires DOM events on a root element to Wrapper actions.
 * Designed as a plain class so it works as a Svelte action or standalone.
 *
 * Responsibilities, each decided by a pure part and acted on here:
 *   - keydown   → `intent.keyAction` → wrapper action, then `focus.focusItem` (in-root scroll)
 *   - click     → `intent.clickIntent` → wrapper action (a link keeps its default)
 *   - focusin   → nearest data-path → wrapper.moveTo(path); focus on the root itself
 *                 redirects to `focus.entryItem`
 *   - focusout  → `intent.focusLeft` → wrapper.blur(), deferred past teardown
 *   - typeahead → `Typeahead` buffers printable keys → wrapper.findByText → wrapper.moveTo
 *
 *   A control nested inside an item (`dom.isNestedInteractive`) owns its own keys and focus.
 *
 * Usage:
 *   const nav = new Navigator(rootEl, wrapper, { collapsible: true })
 *   // …
 *   nav.destroy()
 *
 * Or as a Svelte action (use inside $effect):
 *   $effect(() => {
 *     const nav = new Navigator(node, wrapper, options)
 *     return () => nav.destroy()
 *   })
 */

import { buildKeymap } from './keymap.js'
import { pathOf, isNestedInteractive } from './navigator/dom.js'
import { keyAction, clickIntent, focusLeft } from './navigator/intent.js'
import { Typeahead } from './navigator/typeahead.js'
import { focusItem, entryItem } from './navigator/focus.js'

// ─── Navigator ────────────────────────────────────────────────────────────────

export class Navigator {
	#root
	#wrapper
	#keymap
	#containScroll
	// Set by destroy() so a deferred focusout can tell it's been torn down.
	#destroyed = false

	#typeahead = new Typeahead()

	/**
	 * @param {HTMLElement} root
	 * @param {import('@rokkit/states').Wrapper} wrapper
	 * @param {{ orientation?: string, dir?: string, collapsible?: boolean, containScroll?: boolean }} [options]
	 */
	constructor(root, wrapper, options = {}) {
		this.#root = root
		this.#wrapper = wrapper
		this.#keymap = buildKeymap(options)
		this.#containScroll = options.containScroll ?? false

		root.addEventListener('keydown', this.#onKeydown)
		root.addEventListener('click', this.#onClick)
		root.addEventListener('focusin', this.#onFocusin)
		root.addEventListener('focusout', this.#onFocusout)
		if (this.#containScroll) {
			root.addEventListener('wheel', this.#onWheel, { passive: false })
		}
	}

	destroy() {
		this.#destroyed = true
		this.#root.removeEventListener('keydown', this.#onKeydown)
		this.#root.removeEventListener('click', this.#onClick)
		this.#root.removeEventListener('focusin', this.#onFocusin)
		this.#root.removeEventListener('focusout', this.#onFocusout)
		if (this.#containScroll) {
			this.#root.removeEventListener('wheel', this.#onWheel)
		}
		this.#typeahead.clear()
	}

	// ─── Keydown ────────────────────────────────────────────────────────────

	#onKeydown = (/** @type {KeyboardEvent} */ event) => {
		// A control nested in an item (Toggle, Switch, input, contenteditable) owns its keys.
		if (isNestedInteractive(event.target, this.#root)) return
		if (this.#tryTypeahead(event)) return
		const action = keyAction(event, this.#root, this.#keymap)
		if (!action) return
		event.preventDefault()
		event.stopPropagation()
		// Every action gets the focused item's path; movement ignores it.
		this.#dispatch(action, pathOf(document.activeElement, this.#root))
		this.#syncFocus()
	}

	// ─── Click ──────────────────────────────────────────────────────────────

	#onClick = (/** @type {MouseEvent} */ event) => {
		const intent = clickIntent(event, this.#root)
		if (!intent) return
		// A link still navigates; state updates either way.
		if (!intent.native) event.preventDefault()
		// No focus sync: the user clicked where they wanted.
		this.#dispatch(intent.action, intent.path)
	}

	// ─── Focusin ────────────────────────────────────────────────────────────

	#onFocusin = (/** @type {FocusEvent} */ event) => {
		// Tabbed into a control nested in a row: it owns the focus context, the wrapper keeps its key.
		if (isNestedInteractive(event.target, this.#root)) return
		const path = pathOf(event.target, this.#root)
		if (path !== null) {
			this.#wrapper.moveTo(path)
			return
		}
		// Focus landed on the root itself — redirect to an item; focusin re-fires on it.
		entryItem(this.#root, this.#wrapper.focusedKey)?.focus()
	}

	// ─── Wheel ──────────────────────────────────────────────────────────────

	#onWheel = (/** @type {WheelEvent} */ event) => {
		// Prevent the wheel event from bubbling to parent scroll containers.
		// Native scroll chaining is handled via CSS overscroll-behavior: contain.
		event.stopPropagation()
	}

	// ─── Focusout ───────────────────────────────────────────────────────────

	#onFocusout = (/** @type {FocusEvent} */ event) => {
		if (!focusLeft(this.#root, /** @type {Node | null} */ (event.relatedTarget))) return
		// Removing a focused element also fires focusout with a null relatedTarget, so teardown
		// looks exactly like a real blur here. Calling wrapper.blur() synchronously then mutates
		// state during Svelte's effect-cleanup phase, which throws `state_unsafe_mutation`.
		// Deferring by a microtask lets destroy() land first, so a torn-down navigator stays quiet
		// while a genuine blur still reaches the wrapper. JSDOM never fires focusout on removal, so
		// this only shows up in a real browser — see packages/ui/browser/Select.browser.spec.ts.
		queueMicrotask(() => {
			if (this.#destroyed) return
			this.#wrapper.blur?.()
		})
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

	// ─── Focus ──────────────────────────────────────────────────────────────

	/** Move DOM focus to the wrapper's item and scroll it into view within the root only. */
	#syncFocus() {
		focusItem(this.#root, this.#wrapper.focusedKey)
	}

	// ─── Typeahead ───────────────────────────────────────────────────────────

	/**
	 * A printable key searches the items by text. True when it matched (and was consumed); a key
	 * that matches nothing still extends the search but falls through to the keymap.
	 *
	 * @param {KeyboardEvent} event
	 * @returns {boolean}
	 */
	#tryTypeahead(event) {
		if (!this.#typeahead.accepts(event)) return false
		const match = this.#typeahead.type(event.key, this.#wrapper.focusedKey, (text, after) =>
			this.#wrapper.findByText(text, after)
		)
		if (match === null) return false
		event.preventDefault()
		event.stopPropagation()
		this.#wrapper.moveTo(match)
		this.#syncFocus()
		return true
	}
}
