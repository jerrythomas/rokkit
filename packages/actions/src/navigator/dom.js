/**
 * Pure DOM questions the Navigator asks about an event target: which item it is in, what a click
 * means, and whether the item — or a control nested inside it — should be left alone.
 */

// ─── Click action resolution ──────────────────────────────────────────────────

/**
 * Determine the action for a mouse click based on modifiers and target.
 * Group headers marked with data-accordion-trigger dispatch 'toggle'.
 *
 * @param {MouseEvent} event
 * @returns {string}
 */
export function clickAction(event) {
	const { shiftKey, ctrlKey, metaKey, target } = event
	if (shiftKey) return 'range'
	if (ctrlKey) return 'extend'
	if (metaKey) return 'extend'
	if (target.closest('[data-accordion-trigger]')) return 'toggle'
	return 'select'
}

// ─── Nested interactive detection ─────────────────────────────────────────────

// Elements that own their own click / keyboard activation. When one of these
// sits *inside* a [data-path] item (e.g. a Toggle / Switch inside a List header
// or config-style row), Navigator must not hijack the event — the nested
// control owns it.
const INTERACTIVE_SELECTOR = [
	'button',
	'a[href]',
	'input',
	'select',
	'textarea',
	'[role="button"]',
	'[role="switch"]',
	'[role="checkbox"]',
	'[role="menuitem"]',
	'[role="menuitemcheckbox"]',
	'[role="menuitemradio"]',
	'[role="radio"]',
	'[role="tab"]',
	'[role="link"]',
	'[contenteditable=""]',
	'[contenteditable="true"]'
].join(',')

/**
 * True when `target` sits inside an interactive element that is a *descendant*
 * of the nearest [data-path] element — i.e. the interactive is embedded inside
 * the item, not the item itself. In that case Navigator defers.
 *
 * An interactive marked with data-accordion-trigger is treated as a legitimate
 * Navigator hook (custom expand/collapse control) and does NOT trigger the
 * skip — Navigator will still dispatch toggle for it.
 *
 * @param {EventTarget|null} target
 * @param {HTMLElement} root
 * @returns {boolean}
 */
export function isNestedInteractive(target, root) {
	const el = /** @type {HTMLElement|null} */ (target)
	/* v8 ignore start -- a dispatched DOM event always carries a target; the null
	   branch exists for the EventTarget|null type, not for a reachable state.
	   `ignore next` does not fire on a single-line `if (...) return`. */
	if (!el) return false
	/* v8 ignore stop */
	const interactive = /** @type {HTMLElement|null} */ (el.closest(INTERACTIVE_SELECTOR))
	if (!interactive || !root.contains(interactive)) return false
	// A nested element explicitly declared as an accordion trigger is a
	// Navigator-controlled control, not a stray interactive — let it through.
	if (interactive.hasAttribute('data-accordion-trigger')) return false
	return isStrictlyInsideItem(el, interactive)
}

/**
 * True when `interactive` sits STRICTLY inside the `[data-path]` item that
 * contains `el` — i.e. the item exists, is not the interactive itself, and
 * really is its ancestor. Being the item (a `<button data-path>` list row) is
 * the normal case and must not count as nesting.
 *
 * @param {HTMLElement} el
 * @param {HTMLElement} interactive
 * @returns {boolean}
 */
function isStrictlyInsideItem(el, interactive) {
	const item = /** @type {HTMLElement|null} */ (el.closest('[data-path]'))
	if (!item || interactive === item) return false
	return item.contains(interactive)
}

/**
 * True when the [data-path] element containing `target` is marked disabled
 * via `data-disabled` (attribute present) or `aria-disabled="true"`. Native
 * `<button disabled>` is already blocked by the browser, so this only matters
 * for div/span-based items that opt into disabled via attributes.
 *
 * @param {EventTarget|null} target
 * @param {HTMLElement} root
 * @returns {boolean}
 */
export function isDisabledItem(target, root) {
	const el = /** @type {HTMLElement|null} */ (target)
	/* v8 ignore start -- see isNestedInteractive: event.target is never null */
	if (!el) return false
	/* v8 ignore stop */
	const dataPathEl = /** @type {HTMLElement|null} */ (el.closest('[data-path]'))
	if (!dataPathEl || !root.contains(dataPathEl)) return false
	if (dataPathEl.hasAttribute('data-disabled')) return true
	if (dataPathEl.getAttribute('aria-disabled') === 'true') return true
	return false
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
export function pathOf(target, root) {
	let el = /** @type {HTMLElement|null} */ (target)
	while (el && el !== root) {
		if (el.dataset?.path !== undefined) return el.dataset.path
		el = el.parentElement
	}
	return null
}
