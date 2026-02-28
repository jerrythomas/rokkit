/**
 * AbstractWrapper — base class defining the interface the Navigator calls into.
 *
 * Action names on AbstractWrapper match the action names in the keymap exactly.
 * The Navigator dispatches: wrapper[action](path) for path-bearing actions,
 * or wrapper[action]() for movement actions that use internal focusedKey.
 *
 * Subclasses (e.g. Wrapper) implement the actual state logic.
 *
 * ─── Uniform signature: every method receives path ──────────────────────────
 *
 * The Navigator always resolves the current path (from document.activeElement
 * or the clicked element) and passes it to every action. This keeps dispatch
 * simple: wrapper[action](path) for all cases.
 *
 *   select(path)          activate item — path is the target; falls back to focusedKey
 *   extend(path)          toggle selection — same fallback
 *   range(path)           range-select to path — same fallback
 *   toggle(path)          flip expansion of group at path
 *   moveTo(path)          sync focused state to path (focusin, typeahead result)
 *   cancel(path)          Escape key — close dropdown, deselect, or dismiss overlay
 *
 *   next(path)            focus next visible item     — path ignored, uses focusedKey
 *   prev(path)            focus previous visible item — path ignored
 *   first(path)           focus first visible item    — path ignored
 *   last(path)            focus last visible item     — path ignored
 *   expand(path)          expand focused group        — path ignored, uses focusedKey
 *   collapse(path)        collapse focused group      — path ignored, uses focusedKey
 *
 * ─── Called by Navigator for typeahead ───────────────────────────────────────
 *
 *   findByText(query, startAfterKey)
 *                         return key of first visible item whose text starts with query
 *                         startAfterKey allows cycling through multiple matches
 *                         returns null if no match
 *
 * ─── State read by Navigator ─────────────────────────────────────────────────
 *
 *   focusedKey            string|null  — key of the currently focused item
 *                         Navigator reads this after keyboard actions to scroll the
 *                         matching [data-path] element into view
 */
export class AbstractWrapper {
	// ─── State read by Navigator ─────────────────────────────────────────────
	//
	// Declared as a getter (not a class field) so subclass getters can override it.
	// A class field `focusedKey = null` would be set as an OWN property during
	// super(), shadowing any getter defined on the subclass prototype.
	//
	/** @returns {string|null} */
	get focusedKey() { return null }

	// ─── Selection actions (path used; fall back to focusedKey when null) ───────

	/** @param {string|null} _path */
	select(_path) {}

	/** @param {string|null} _path */
	extend(_path) {}

	/** @param {string|null} _path */
	range(_path) {}

	/** @param {string|null} _path */
	toggle(_path) {}

	/** @param {string|null} _path */
	moveTo(_path) {}

	/** @param {string|null} _path */
	cancel(_path) {}

	// ─── Movement actions (path passed through but ignored) ──────────────────

	/** @param {string|null} _path */
	next(_path) {}

	/** @param {string|null} _path */
	prev(_path) {}

	/** @param {string|null} _path */
	first(_path) {}

	/** @param {string|null} _path */
	last(_path) {}

	/** @param {string|null} _path */
	expand(_path) {}

	/** @param {string|null} _path */
	collapse(_path) {}

	// ─── Typeahead support ───────────────────────────────────────────────────

	/**
	 * @param {string} query
	 * @param {string|null} startAfterKey
	 * @returns {string|null}
	 */
	findByText(query, _startAfterKey = null) {
		return null
	}
}
