/**
 * Moving DOM focus to the wrapper's item after the navigator changed it — pure over `root`.
 *
 * Both halves exist to keep the page still: `preventScroll` stops `focus()` scrolling every
 * scrollable ancestor, and `scrollWithin` scrolls only the root, so a list inside a scrollable
 * panel (a Select dropdown in a canvas body) never drags the page along.
 */

/**
 * Scroll `el` into view within `root` only — never walk ancestors. Nearest edge wins; a visible
 * item does not move.
 *
 * @param {HTMLElement} root
 * @param {HTMLElement} el
 */
export function scrollWithin(root, el) {
	const itemTop = el.offsetTop
	const itemBottom = itemTop + el.offsetHeight
	const visibleTop = root.scrollTop
	if (itemTop < visibleTop) {
		root.scrollTop = itemTop
	} else if (itemBottom > visibleTop + root.clientHeight) {
		root.scrollTop = itemBottom - root.clientHeight
	}
}

/**
 * Focus the item at `key` (unless it already has focus) and scroll it into view within `root`.
 * No key, or no item for it inside the root, is a no-op.
 *
 * @param {HTMLElement} root
 * @param {string | null | undefined} key
 */
export function focusItem(root, key) {
	if (!key) return
	const el = /** @type {HTMLElement | null} */ (root.querySelector(`[data-path="${key}"]`))
	if (!el) return
	if (el !== document.activeElement) el.focus({ preventScroll: true })
	scrollWithin(root, el)
}
