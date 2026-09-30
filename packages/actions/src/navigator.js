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

import { TYPEAHEAD_RESET_MS } from './nav-constants.js'
import { buildKeymap, resolveAction } from './keymap.js'
import { pathOf, clickAction, isNestedInteractive, isDisabledItem } from './navigator/dom.js'

// ─── Navigator ────────────────────────────────────────────────────────────────

export class Navigator {
	#root
	#wrapper
	#keymap
	#containScroll
	// Set by destroy() so a deferred focusout can tell it's been torn down.
	#destroyed = false

	// Typeahead state
	#buffer = ''
	#bufferTimer = null

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
		this.#clearTypeahead()
	}

	// ─── Keydown ────────────────────────────────────────────────────────────

	#onKeydown = (/** @type {KeyboardEvent} */ event) => {
		// Defer to a nested interactive descendant (Toggle / Switch / input /
		// contenteditable inside an item snippet) — it owns its own keys.
		if (isNestedInteractive(event.target, this.#root)) return

		// Typeahead: single printable character (no modifiers except shift for caps)
		if (this.#tryTypeahead(event)) return

		const action = resolveAction(event, this.#keymap)
		if (!action) return

		// Links handle Enter/Space natively — browser fires a synthetic click
		if (action === 'select' && event.target.closest('a[href]')) return

		// Item explicitly marked disabled via attributes (div/span items opt in
		// this way since they cannot use the native `disabled` attribute).
		if (isDisabledItem(document.activeElement, this.#root)) return

		event.preventDefault()
		event.stopPropagation()

		// Resolve current path from the focused element so all actions get context
		const path = pathOf(document.activeElement, this.#root)
		this.#dispatch(action, path)

		// Scroll focused item into view after keyboard navigation
		this.#syncFocus()
	}

	// ─── Click ──────────────────────────────────────────────────────────────

	#onClick = (/** @type {MouseEvent} */ event) => {
		// Defer to a nested interactive descendant — the click is meant for it.
		if (isNestedInteractive(event.target, this.#root)) return

		const path = pathOf(event.target, this.#root)
		if (path === null) return

		// Item explicitly marked disabled via attributes.
		if (isDisabledItem(event.target, this.#root)) return

		const action = clickAction(event)

		// Links: let browser navigate naturally, still update state
		if (!event.target.closest('a[href]')) {
			event.preventDefault()
		}

		this.#dispatch(action, path)
		// No scrollIntoView — user clicked where they wanted
	}

	// ─── Focusin ────────────────────────────────────────────────────────────

	#onFocusin = (/** @type {FocusEvent} */ event) => {
		// Focus landed inside a nested interactive (e.g. tabbed to a Switch
		// inside a row) — leave the wrapper's focusedKey alone and let the
		// nested control own the focus context.
		if (isNestedInteractive(event.target, this.#root)) return

		const path = pathOf(event.target, this.#root)

		if (path !== null) {
			// Focused a specific item (click, programmatic focus, or tab with roving tabindex)
			this.#wrapper.moveTo(path)
			return
		}

		// Focused the container itself (user tabbed in, no roving tabindex item yet)
		// Redirect focus to the currently focused item, or first item if none
		const targetKey = this.#wrapper.focusedKey
		const selector = targetKey ? `[data-path="${targetKey}"]` : '[data-path]:not([disabled])'
		const el = /** @type {HTMLElement|null} */ (this.#root.querySelector(selector))
		if (el) {
			el.focus()
			// focusin will re-fire with the item as target, handled above
		}
	}

	// ─── Wheel ──────────────────────────────────────────────────────────────

	#onWheel = (/** @type {WheelEvent} */ event) => {
		// Prevent the wheel event from bubbling to parent scroll containers.
		// Native scroll chaining is handled via CSS overscroll-behavior: contain.
		event.stopPropagation()
	}

	// ─── Focusout ───────────────────────────────────────────────────────────

	#onFocusout = (/** @type {FocusEvent} */ event) => {
		// relatedTarget is the element receiving focus next
		// If it's null or outside this root, focus left the list
		const next = /** @type {Node|null} */ (event.relatedTarget)
		if (!next || !this.#root.contains(next)) {
			// Removing a focused element also fires focusout with a null
			// relatedTarget, so teardown looks exactly like a real blur here. Calling
			// wrapper.blur() synchronously in that case mutates state during Svelte's
			// effect-cleanup phase, which throws `state_unsafe_mutation`. Deferring by
			// a microtask lets destroy() land first, so a torn-down navigator stays
			// quiet while a genuine blur still reaches the wrapper.
			// JSDOM never fires focusout on removal, so this only shows up in a real
			// browser — see packages/ui/browser/Select.browser.spec.ts.
			queueMicrotask(() => {
				if (this.#destroyed) return
				this.#wrapper.blur?.()
			})
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
		// preventScroll stops the browser from cascading the focus call
		// up the ancestor chain and scrolling outer containers.
		if (el !== document.activeElement) el.focus({ preventScroll: true })
		this.#scrollItemIntoView(el)
	}

	/**
	 * Scroll `el` into view *within `this.#root`* only — never walk ancestors.
	 * This prevents page-jumping when the navigator's root is itself inside
	 * a scrollable container (e.g. a Select dropdown inside a scrollable
	 * canvas-body).
	 * @param {HTMLElement} el
	 */
	#scrollItemIntoView(el) {
		const root = this.#root
		const itemTop = el.offsetTop
		const itemBottom = itemTop + el.offsetHeight
		const visibleTop = root.scrollTop
		const visibleBottom = visibleTop + root.clientHeight
		if (itemTop < visibleTop) {
			root.scrollTop = itemTop
		} else if (itemBottom > visibleBottom) {
			root.scrollTop = itemBottom - root.clientHeight
		}
	}

	// ─── Typeahead ───────────────────────────────────────────────────────────

	#isPrintableKey(key, ctrlKey, metaKey, altKey) {
		if (ctrlKey) return false
		if (metaKey) return false
		if (altKey) return false
		if (key.length !== 1) return false
		return key !== ' '
	}

	#appendBuffer(key) {
		const startAfter = this.#buffer.length === 0 ? this.#wrapper.focusedKey : null
		this.#buffer += key
		if (this.#bufferTimer) {
			clearTimeout(this.#bufferTimer)
			this.#bufferTimer = null
		}
		this.#bufferTimer = setTimeout(() => this.#clearTypeahead(), TYPEAHEAD_RESET_MS)
		return startAfter
	}

	/**
	 * Handle printable character keys for typeahead search.
	 * Returns true if the event was consumed.
	 *
	 * @param {KeyboardEvent} event
	 * @returns {boolean}
	 */
	#tryTypeahead(event) {
		const { key, ctrlKey, metaKey, altKey } = event

		if (!this.#isPrintableKey(key, ctrlKey, metaKey, altKey)) return false

		const startAfter = this.#appendBuffer(key)

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
