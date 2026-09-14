/**
 * Shared snippet types for the item-rendering components.
 *
 * List / Tree / Menu / Select / Grid and friends collect their snippets with a
 * rest element (`...snippets`) behind an index signature, because a data item
 * can name its own snippet (`item.snippet = 'name'`, resolved by
 * `resolveSnippet`) — so arbitrary keys must stay accepted.
 *
 * The index signature alone typed every snippet as `unknown`, which made each
 * consumer's snippet parameter implicitly `any`: a snippet body could read any
 * property off `proxy` or pass it somewhere expecting a different type, and
 * nothing complained until runtime. Declaring the documented snippets
 * explicitly fixes that — TypeScript prefers an explicit member over the index
 * signature, so the common case is checked while named snippets still work.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'

/**
 * Renders one item's inner content, given its `ProxyItem`.
 *
 * This is the shape of `itemContent` and `groupContent` — the fallbacks
 * `resolveSnippet` reaches for (`ITEM_SNIPPET` / `GROUP_SNIPPET`), and the
 * shape any per-item named snippet must also have.
 */
export type ItemSnippet = Snippet<[ProxyItem]>

/**
 * Renders one item's inner content plus whether it is currently selected.
 *
 * Used where selection is part of the item's own rendering rather than the
 * wrapper's — Tabs and Toggle both call their content snippet as
 * `content(proxy, selected)`.
 */
export type SelectableItemSnippet = Snippet<[ProxyItem, boolean]>

/**
 * The snippet bag an item-rendering component accepts.
 *
 * Spread into a component's props type so the documented snippets are typed
 * while `item.snippet = 'name'` keeps working:
 *
 * ```ts
 * let { items = [], ...snippets }: { items?: unknown[] } & ItemSnippets = $props()
 * ```
 */
export interface ItemSnippets {
	/** Inner content for a leaf item. */
	itemContent?: ItemSnippet

	/** Inner content for a group/parent item. Falls back to `itemContent`. */
	groupContent?: ItemSnippet

	/**
	 * Per-item named snippets, selected via the item's `snippet` field. Kept as
	 * `unknown` rather than `ItemSnippet` because this signature also has to
	 * admit every other prop the component spreads through.
	 */
	[key: string]: unknown
}
