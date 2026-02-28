/**
 * Testbed Type Definitions
 *
 * TypeScript interfaces and types for the Navigator + Wrapper + Proxy design.
 * These are the explicit contracts — implementations in .js files reference these
 * via JSDoc @implements / @type annotations for IDE support.
 *
 * Intended destination when promoted to packages:
 *   IWrapper, INavigator, NavigatorOptions → @rokkit/actions
 *   IProxyItem, ProxyNode, FlatViewNode, FieldConfig → @rokkit/states
 */

// ─── Field Configuration ──────────────────────────────────────────────────────

/**
 * Maps semantic field names to the actual keys in the raw item object.
 * Any entry can be overridden; unset entries fall back to DEFAULT_FIELDS.
 */
export interface FieldConfig {
	text?: string
	value?: string
	icon?: string
	href?: string
	description?: string
	children?: string
	type?: string
	disabled?: string
	expanded?: string
	selected?: string
	/** Allow any additional custom field mappings */
	[key: string]: string | undefined
}

// ─── Item Types ───────────────────────────────────────────────────────────────

/** The four possible item types in a list. */
export type ItemType = 'item' | 'group' | 'separator' | 'spacer'

// ─── Proxy Interfaces ─────────────────────────────────────────────────────────

/**
 * Public interface of a ProxyItem.
 * Wraps a raw item and provides field-mapped, type-safe access to its properties.
 * Reactive expanded/selected state is internal but readable and writable via these props.
 */
export interface IProxyItem {
	// ─── Structural props ─────────────────────────────────────────────────────
	/** Path-based key: '0', '0-1', '0-1-2'. Invariant: level === key.split('-').length. */
	readonly key: string
	/** Nesting depth. Always equals key.split('-').length (1 = root, 2 = first children, …). */
	readonly level: number

	// ─── Read-only field accessors ───────────────────────────────────────────
	readonly text: string
	readonly value: unknown
	readonly icon: string | undefined
	readonly href: string | undefined
	readonly snippet: string | undefined
	/** Always read from the raw item field — Wrapper never writes this. */
	readonly disabled: boolean
	readonly hasChildren: boolean
	readonly children: IProxyItem[]
	readonly type: ItemType

	// ─── Two-mode reactive state ─────────────────────────────────────────────
	/** Expanded state: reads/writes internal $state; optionally syncs with raw item field. */
	expanded: boolean
	/** Selected state: reads/writes internal $state; optionally syncs with raw item field. */
	selected: boolean

	// ─── Generic field accessor ──────────────────────────────────────────────
	/**
	 * Maps a semantic field name to the raw item value via the fields config.
	 * For field-mapped attributes only (text, value, icon, href, description, …).
	 * Falls back to using fieldName directly as a raw key when not in config.
	 * Returns undefined for primitive items.
	 * Control state (expanded, selected) and computed props (type, hasChildren,
	 * disabled) are accessed directly as properties, not through get().
	 */
	get(fieldName: string): unknown
}

/**
 * A node in the proxy tree structure returned by buildProxyList.
 * Stable reference — created once, never recreated.
 */
export interface ProxyNode {
	key: string
	proxy: IProxyItem
	children: ProxyNode[]
}

/**
 * An entry in the flat ordered list returned by buildFlatView.
 * Separators and spacers appear here (for rendering) but are skipped by navigation.
 */
export interface FlatViewNode {
	key: string
	proxy: IProxyItem
	/** Mirrors proxy.level — equals key.split('-').length. */
	level: number
	hasChildren: boolean
	type: ItemType
}

// ─── Wrapper Interface ────────────────────────────────────────────────────────

/**
 * The interface the Navigator calls into.
 *
 * Uniform signature: every method receives path (string | null).
 * Navigator resolves path from document.activeElement (keyboard) or
 * event.target (click) and passes it to ALL actions unconditionally.
 *
 * Movement methods (next/prev/first/last/expand/collapse) receive path
 * but ignore it — they use focusedKey internally.
 *
 * Selection methods (select/extend/range/toggle/moveTo/cancel) use path,
 * falling back to focusedKey when path is null.
 *
 * Components pass callback hooks to the Wrapper on construction:
 *   new Wrapper(items, fields, { onselect, onchange, oncancel })
 * or wrap them for extra logic:
 *   new Wrapper(items, fields, { onselect: (proxy, key) => { doExtra(); onselect?.(proxy.value) } })
 */
export interface IWrapper {
	// ─── State read by Navigator ─────────────────────────────────────────────
	/** Key of the currently focused item. Navigator reads this after keyboard actions
	 *  to scroll the matching [data-path] element into view. */
	readonly focusedKey: string | null

	// ─── Selection actions ───────────────────────────────────────────────────
	select(path: string | null): void
	extend(path: string | null): void
	range(path: string | null): void
	toggle(path: string | null): void
	moveTo(path: string | null): void
	cancel(path: string | null): void
	blur(): void

	// ─── Movement actions (path ignored, uses focusedKey internally) ─────────
	next(path: string | null): void
	prev(path: string | null): void
	first(path: string | null): void
	last(path: string | null): void
	expand(path: string | null): void
	collapse(path: string | null): void

	// ─── Typeahead ───────────────────────────────────────────────────────────
	/**
	 * Return the key of the first visible, non-disabled item whose text starts
	 * with query (case-insensitive). startAfterKey enables cycling through
	 * multiple matches. Returns null if no match found.
	 */
	findByText(query: string, startAfterKey: string | null): string | null
}

// ─── Navigator Interface ──────────────────────────────────────────────────────

/** Options passed to the Navigator constructor. */
export interface NavigatorOptions {
	orientation?: 'vertical' | 'horizontal'
	dir?: 'ltr' | 'rtl'
	collapsible?: boolean
}

/**
 * The Navigator class interface.
 * Attaches DOM event listeners (keydown, click, focusin, focusout) to a root
 * element and translates them into IWrapper method calls.
 *
 * Also used as a Svelte action via the `navigator` function adapter:
 *   use:navigator={{ wrapper, collapsible }}
 */
export interface INavigator {
	/** Remove all event listeners and clean up typeahead timer. */
	destroy(): void
}
