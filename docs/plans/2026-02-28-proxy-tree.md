# ProxyTree + Lazy Loading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create `ProxyTree` class for reactive collection management, refactor Wrapper to receive ProxyTree, make LazyWrapper extend Wrapper, rename `onloadchildren` → `onlazyload`, add `hasMore` + Load More to LazyTree.

**Architecture:** ProxyTree owns proxy creation, reactive flatView/lookup, and structural mutations (append, addChildren). Wrapper receives a ProxyTree and provides navigation/selection. LazyWrapper extends Wrapper, overriding only `expand()` and `select()` for lazy marker detection. Both Tree and LazyTree components create ProxyTree externally and pass to their wrapper.

**Tech Stack:** Svelte 5 (`$state`, `$derived`), Vitest with `svelte/reactivity`, `@rokkit/states` package.

**Test command:** `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states`

**All file paths relative to:** `/Users/Jerry/Developer/rokkit/solution`

---

## Task 1: Create ProxyTree class with tests

Extract `buildReactiveFlatView` and `buildReactiveLookup` from `lazy-wrapper.svelte.js` into a new `ProxyTree` class. Add `append()` and `addChildren()` mutation methods.

**Files:**
- Create: `packages/states/src/proxy-tree.svelte.js`
- Create: `packages/states/spec/proxy-tree.spec.svelte.js`

### Step 1: Write ProxyTree tests

```js
// packages/states/spec/proxy-tree.spec.svelte.js
import { describe, it, expect } from 'vitest'
import { ProxyTree } from '../src/proxy-tree.svelte.js'
import { ProxyItem, LazyProxyItem } from '../src/proxy-item.svelte.js'
import { flushSync } from 'svelte'

describe('ProxyTree', () => {
	describe('construction', () => {
		it('should create root proxies from items', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])
			expect(tree.roots).toHaveLength(3)
			expect(tree.roots[0]).toBeInstanceOf(ProxyItem)
			expect(tree.roots[0].key).toBe('0')
			expect(tree.roots[0].level).toBe(1)
			expect(tree.roots[0].text).toBe('A')
		})

		it('should accept custom fields', () => {
			const tree = new ProxyTree(
				[{ name: 'Item', id: 1 }],
				{ text: 'name', value: 'id' }
			)
			expect(tree.roots[0].text).toBe('Item')
			expect(tree.roots[0].value).toBe(1)
		})

		it('should accept custom proxy factory', () => {
			const tree = new ProxyTree(
				[{ text: 'A', children: true }],
				{},
				{
					createProxy: (raw, fields, key, level) =>
						new LazyProxyItem(raw, fields, key, level, null)
				}
			)
			expect(tree.roots[0]).toBeInstanceOf(LazyProxyItem)
		})

		it('should handle empty items', () => {
			const tree = new ProxyTree([])
			expect(tree.roots).toHaveLength(0)
			expect(tree.flatView).toHaveLength(0)
			expect(tree.lookup.size).toBe(0)
		})

		it('should handle null/undefined items', () => {
			const tree = new ProxyTree(null)
			expect(tree.roots).toHaveLength(0)
		})
	})

	describe('flatView', () => {
		it('should derive flat view from roots', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' }
			])
			expect(tree.flatView).toHaveLength(2)
			expect(tree.flatView[0].key).toBe('0')
			expect(tree.flatView[0].proxy.text).toBe('A')
			expect(tree.flatView[1].key).toBe('1')
		})

		it('should include nested children when expanded', () => {
			const tree = new ProxyTree([
				{
					text: 'Parent', value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				}
			])

			expect(tree.flatView).toHaveLength(1) // collapsed

			tree.roots[0].expanded = true
			flushSync()

			expect(tree.flatView).toHaveLength(2)
			expect(tree.flatView[1].proxy.text).toBe('Child')
		})

		it('should compute lineTypes correctly', () => {
			const tree = new ProxyTree([
				{
					text: 'P', value: 'p',
					children: [
						{ text: 'C1', value: 'c1' },
						{ text: 'C2', value: 'c2' }
					]
				},
				{ text: 'S', value: 's' }
			])

			tree.roots[0].expanded = true
			flushSync()

			expect(tree.flatView[0].lineTypes).toEqual(['icon'])
			expect(tree.flatView[1].lineTypes).toEqual(['child', 'empty'])
			expect(tree.flatView[2].lineTypes).toEqual(['last', 'empty'])
			expect(tree.flatView[3].lineTypes).toEqual(['empty'])
		})

		it('should include isExpandable for lazy markers', () => {
			const tree = new ProxyTree([
				{ text: 'Lazy', value: 'l', children: true }
			])
			expect(tree.flatView[0].isExpandable).toBe(true)
			expect(tree.flatView[0].hasChildren).toBe(false)
		})
	})

	describe('lookup', () => {
		it('should map all proxies by key including nested', () => {
			const tree = new ProxyTree([
				{
					text: 'P', value: 'p',
					children: [{ text: 'C', value: 'c' }]
				}
			])
			expect(tree.lookup.size).toBe(2)
			expect(tree.lookup.get('0').text).toBe('P')
			expect(tree.lookup.get('0-0').text).toBe('C')
		})
	})

	describe('append', () => {
		it('should add root items with correct keys', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' }
			])

			tree.append([
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])
			flushSync()

			expect(tree.roots).toHaveLength(3)
			expect(tree.roots[1].key).toBe('1')
			expect(tree.roots[2].key).toBe('2')
			expect(tree.flatView).toHaveLength(3)
			expect(tree.lookup.size).toBe(3)
		})

		it('should use correct start index when appending to existing', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' }
			])

			tree.append([{ text: 'C', value: 'c' }])
			flushSync()

			expect(tree.roots[2].key).toBe('2')
			expect(tree.roots[2].text).toBe('C')
		})

		it('should preserve existing proxies on append', () => {
			const tree = new ProxyTree([{ text: 'A', value: 'a' }])
			const original = tree.roots[0]

			tree.append([{ text: 'B', value: 'b' }])
			flushSync()

			expect(tree.roots[0]).toBe(original) // same reference
		})

		it('should use custom factory for appended items', () => {
			const tree = new ProxyTree([], {}, {
				createProxy: (raw, fields, key, level) =>
					new LazyProxyItem(raw, fields, key, level, null)
			})

			tree.append([{ text: 'A', value: 'a' }])
			flushSync()

			expect(tree.roots[0]).toBeInstanceOf(LazyProxyItem)
		})
	})

	describe('addChildren', () => {
		it('should add children to a proxy node', () => {
			const tree = new ProxyTree([
				{ text: 'Parent', value: 'p' }
			])
			const parent = tree.roots[0]

			tree.addChildren(parent, [
				{ text: 'C1', value: 'c1' },
				{ text: 'C2', value: 'c2' }
			])
			flushSync()

			expect(parent.hasChildren).toBe(true)
			expect(parent.children).toHaveLength(2)
			expect(parent.children[0].key).toBe('0-0')
			expect(parent.children[1].key).toBe('0-1')
		})

		it('should update flatView after addChildren + expand', () => {
			const tree = new ProxyTree([
				{ text: 'Parent', value: 'p' }
			])

			tree.addChildren(tree.roots[0], [{ text: 'Child', value: 'c' }])
			tree.roots[0].expanded = true
			flushSync()

			expect(tree.flatView).toHaveLength(2)
			expect(tree.flatView[1].proxy.text).toBe('Child')
		})

		it('should update lookup after addChildren', () => {
			const tree = new ProxyTree([
				{ text: 'Parent', value: 'p' }
			])

			tree.addChildren(tree.roots[0], [{ text: 'Child', value: 'c' }])
			flushSync()

			expect(tree.lookup.size).toBe(2)
			expect(tree.lookup.get('0-0').text).toBe('Child')
		})

		it('should update original raw item', () => {
			const items = [{ text: 'Parent', value: 'p' }]
			const tree = new ProxyTree(items)

			tree.addChildren(tree.roots[0], [{ text: 'Child', value: 'c' }])
			flushSync()

			expect(items[0].children).toHaveLength(1)
			expect(items[0].children[0].text).toBe('Child')
		})
	})
})
```

### Step 2: Run tests to verify they fail

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states spec/proxy-tree.spec.svelte.js`
Expected: FAIL — `proxy-tree.svelte.js` doesn't exist yet.

### Step 3: Implement ProxyTree

```js
// packages/states/src/proxy-tree.svelte.js
/**
 * ProxyTree
 *
 * Reactive collection manager that owns proxy instances.
 * Provides structural mutation methods (append, addChildren) with
 * batched version management. Derives flatView and lookup reactively.
 *
 * Used by Wrapper and LazyWrapper as their data layer.
 */

import { ProxyItem, PROXY_ITEM_FIELDS } from './proxy-item.svelte.js'

// Maps a parent's line type to the continuation type shown at the same column
// in child rows below it.
const NEXT_LINE = { child: 'sibling', last: 'empty', sibling: 'sibling', empty: 'empty', icon: 'empty' }

/**
 * Build flat view by walking proxy.children ($derived) recursively.
 * Reads proxy.expanded ($state) and proxy.children ($derived), so any
 * $derived wrapping this function re-computes on expansion or children changes.
 */
function buildReactiveFlatView(proxies, parentLineTypes = []) {
	const result = []
	for (let i = 0; i < proxies.length; i++) {
		const proxy = proxies[i]
		const children = proxy.children
		const hasChildren = children.length > 0
		const isExpandable = hasChildren || proxy.get('children') === true
		const isLast = i === proxies.length - 1
		const position = isLast ? 'last' : 'child'

		const inherited = parentLineTypes.slice(0, -1).map((t) => NEXT_LINE[t] ?? 'empty')
		if (parentLineTypes.length > 0) inherited.push(position)
		const lineTypes = [...inherited, isExpandable ? 'icon' : 'empty']

		result.push({
			key: proxy.key,
			proxy,
			level: proxy.level,
			hasChildren,
			isExpandable,
			type: proxy.type,
			lineTypes
		})
		if (hasChildren && proxy.expanded) {
			result.push(...buildReactiveFlatView(children, lineTypes))
		}
	}
	return result
}

/**
 * Build lookup Map by walking proxy.children ($derived) recursively.
 * Traverses ALL children (not just expanded) so keys are available
 * for selection and navigation even before a group is opened.
 */
function buildReactiveLookup(proxies, map = new Map()) {
	for (const proxy of proxies) {
		map.set(proxy.key, proxy)
		const children = proxy.children
		if (children.length > 0) {
			buildReactiveLookup(children, map)
		}
	}
	return map
}

export class ProxyTree {
	#rootProxies = $state([])
	#fields
	#factory

	// Reactive derived views — re-derive on proxy.expanded, proxy.children, or structural changes
	flatView = $derived(buildReactiveFlatView(this.#rootProxies))
	#lookup = $derived(buildReactiveLookup(this.#rootProxies))

	/**
	 * @param {unknown[]} [items]
	 * @param {Partial<typeof PROXY_ITEM_FIELDS>} [fields]
	 * @param {{ createProxy?: (raw: *, fields: object, key: string, level: number) => ProxyItem }} [options]
	 */
	constructor(items = [], fields = {}, options = {}) {
		this.#fields = { ...PROXY_ITEM_FIELDS, ...fields }
		this.#factory = options.createProxy ?? ((raw, f, key, level) => new ProxyItem(raw, f, key, level))
		this.#rootProxies = (items ?? []).map((raw, i) => this.#factory(raw, this.#fields, String(i), 1))
	}

	/** Root proxy array */
	get roots() { return this.#rootProxies }

	/** Reactive lookup Map<key, ProxyItem> */
	get lookup() { return this.#lookup }

	/**
	 * Append root-level items. Keys start at current root count.
	 * @param {unknown[]} items
	 */
	append(items) {
		const start = this.#rootProxies.length
		const newProxies = items.map((raw, i) =>
			this.#factory(raw, this.#fields, String(start + i), 1)
		)
		this.#rootProxies = [...this.#rootProxies, ...newProxies]
	}

	/**
	 * Add children to a proxy node.
	 * Creates child proxies and writes them to the parent via set('children', ...).
	 * @param {ProxyItem} proxy
	 * @param {unknown[]} items
	 */
	addChildren(proxy, items) {
		const rawChildren = items.map((raw, i) =>
			typeof raw === 'object' && raw !== null ? raw : { text: raw, value: raw }
		)
		proxy.set('children', rawChildren)
	}
}
```

### Step 4: Run tests to verify they pass

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states spec/proxy-tree.spec.svelte.js`
Expected: PASS — all ProxyTree tests green.

### Step 5: Export ProxyTree from index

**Modify:** `packages/states/src/index.js`

Add after the LazyWrapper export line:
```js
export { ProxyTree } from './proxy-tree.svelte.js'
```

**Modify:** `packages/states/spec/index.spec.js`

Add `ProxyTree` to the exports verification test.

### Step 6: Run full states test suite

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states`
Expected: PASS — all existing tests still pass, plus new ProxyTree tests.

### Step 7: Commit

```bash
git add packages/states/src/proxy-tree.svelte.js packages/states/spec/proxy-tree.spec.svelte.js packages/states/src/index.js packages/states/spec/index.spec.js
git commit -m "feat(states): add ProxyTree reactive collection manager

Extracts buildReactiveFlatView/buildReactiveLookup from LazyWrapper into
ProxyTree class. Adds append() and addChildren() for structural mutations
with reactive flatView/lookup derivation."
```

---

## Task 2: Refactor LazyWrapper to use ProxyTree internally

Replace LazyWrapper's inline proxy creation and reactive utilities with ProxyTree delegation. This is a refactor — all existing LazyWrapper tests must still pass.

**Files:**
- Modify: `packages/states/src/lazy-wrapper.svelte.js`

### Step 1: Rewrite LazyWrapper to delegate to ProxyTree

Replace the LazyWrapper class to use ProxyTree internally. The constructor creates a ProxyTree and delegates flatView/lookup to it. All navigation logic stays the same. `buildReactiveFlatView` and `buildReactiveLookup` are removed from this file (now in ProxyTree).

```js
// packages/states/src/lazy-wrapper.svelte.js
/**
 * LazyWrapper
 *
 * Wrapper variant that uses ProxyTree for reactive data management.
 * Provides navigation, expansion, selection, and lazy loading support.
 *
 * ProxyTree handles: proxy creation, flatView derivation, lookup map.
 * LazyWrapper handles: focused key, navigation, expand/collapse, selection, typeahead.
 */

import { AbstractWrapper } from './abstract-wrapper.js'
import { PROXY_ITEM_FIELDS } from './proxy-item.svelte.js'
import { ProxyTree } from './proxy-tree.svelte.js'

export class LazyWrapper extends AbstractWrapper {
	// ─── Data (delegated to ProxyTree) ────────────────────────────────────────
	#proxyTree

	get flatView() { return this.#proxyTree.flatView }

	#navigable = $derived(
		this.flatView.filter(
			(n) => n.type !== 'separator' && n.type !== 'spacer' && !n.proxy.disabled
		)
	)

	// ─── State ──────────────────────────────────────────────────────────────────
	#focusedKey = $state(null)

	// ─── Callbacks ──────────────────────────────────────────────────────────────
	#onselect
	#onchange
	#selectedValue = $state(undefined)

	/**
	 * @param {unknown[]} [items]
	 * @param {Partial<typeof PROXY_ITEM_FIELDS>} [fields]
	 * @param {{ onselect?: Function, onchange?: Function, createProxy?: Function }} [options]
	 */
	constructor(items = [], fields = {}, options = {}) {
		super()
		this.#proxyTree = new ProxyTree(items, fields, { createProxy: options.createProxy })
		this.#onselect = options.onselect
		this.#onchange = options.onchange
	}

	// ─── IWrapper: state ──────────────────────────────────────────────────────
	get focusedKey() { return this.#focusedKey }

	// ─── IWrapper: movement ───────────────────────────────────────────────────
	// (identical to current — no changes needed)

	next(_path) {
		const nav = this.#navigable
		if (!nav.length) return
		const idx = nav.findIndex((n) => n.key === this.#focusedKey)
		if (idx < nav.length - 1) this.#focusedKey = nav[idx + 1].key
	}

	prev(_path) {
		const nav = this.#navigable
		if (!nav.length) return
		const idx = nav.findIndex((n) => n.key === this.#focusedKey)
		if (idx > 0) this.#focusedKey = nav[idx - 1].key
	}

	first(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[0].key
	}

	last(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[nav.length - 1].key
	}

	expand(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node) return

		if (!node.hasChildren && node.proxy.loaded === false) {
			node.proxy.fetch().then(() => {
				node.proxy.expanded = true
			})
			return
		}

		if (!node.hasChildren) return
		if (!node.proxy.expanded) {
			node.proxy.expanded = true
		} else {
			this.next(null)
		}
	}

	collapse(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node) return
		if (node.hasChildren && node.proxy.expanded) {
			node.proxy.expanded = false
		} else {
			const parts = this.#focusedKey.split('-')
			if (parts.length > 1) {
				parts.pop()
				this.#focusedKey = parts.join('-')
			}
		}
	}

	// ─── IWrapper: selection ──────────────────────────────────────────────────

	select(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		this.#focusedKey = key
		const proxy = this.#proxyTree.lookup.get(key)
		if (!proxy) return
		if (proxy.hasChildren) {
			proxy.expanded = !proxy.expanded
			return
		}
		if (proxy.loaded === false) {
			proxy.fetch().then(() => { proxy.expanded = true })
			return
		}
		if (proxy.value !== this.#selectedValue) {
			this.#selectedValue = proxy.value
			this.#onchange?.(proxy.value, proxy)
		}
		this.#onselect?.(proxy.value, proxy)
	}

	toggle(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		const proxy = this.#proxyTree.lookup.get(key)
		if (!proxy) return
		if (proxy.hasChildren) {
			proxy.expanded = !proxy.expanded
			return
		}
		if (proxy.loaded === false) {
			proxy.fetch().then(() => { proxy.expanded = true })
		}
	}

	moveTo(path) {
		if (path !== null) this.#focusedKey = path
	}

	moveToValue(v) {
		if (v === undefined || v === null) return
		for (const [key, proxy] of this.#proxyTree.lookup) {
			if (proxy.value === v) {
				this.#focusedKey = key
				this.#selectedValue = v
				return
			}
		}
	}

	cancel(_path) {}
	blur() {}
	extend(_path) {}
	range(_path) {}

	// ─── IWrapper: typeahead ──────────────────────────────────────────────────

	findByText(query, startAfterKey = null) {
		const nav = this.#navigable
		if (!nav.length) return null
		const q = query.toLowerCase()
		const startIdx = startAfterKey
			? nav.findIndex((n) => n.key === startAfterKey) + 1
			: 0
		for (let i = 0; i < nav.length; i++) {
			const node = nav[(startIdx + i) % nav.length]
			if (node.proxy.text.toLowerCase().startsWith(q)) return node.key
		}
		return null
	}

	// ─── Helpers ──────────────────────────────────────────────────────────────

	get lookup() { return this.#proxyTree.lookup }

	/** Access the underlying ProxyTree for append/addChildren operations */
	get proxyTree() { return this.#proxyTree }
}
```

### Step 2: Run existing LazyWrapper tests

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states spec/lazy-wrapper.spec.svelte.js`
Expected: PASS — all 25+ existing tests still green. The refactor is internal only.

### Step 3: Run full states test suite

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states`
Expected: PASS — all tests pass.

### Step 4: Run UI tests (Tree uses LazyWrapper)

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project ui spec/Tree.spec.svelte.ts`
Expected: PASS — Tree component unaffected since LazyWrapper API is unchanged.

### Step 5: Commit

```bash
git add packages/states/src/lazy-wrapper.svelte.js
git commit -m "refactor(states): LazyWrapper delegates to ProxyTree

Internal refactor — LazyWrapper now creates ProxyTree and delegates
flatView/lookup to it. All existing tests pass unchanged."
```

---

## Task 3: Add `onlazyload` support + `loadMore()` to LazyWrapper

Rename `onloadchildren` → `onlazyload` in tests/components. Add `loadMore()` method that calls `onlazyload()` (no args) and appends results via `proxyTree.append()`.

**Files:**
- Modify: `packages/states/src/lazy-wrapper.svelte.js`
- Modify: `packages/states/spec/lazy-wrapper.spec.svelte.js`

### Step 1: Write new tests for onlazyload + loadMore

Add the following tests to the existing `lazy-wrapper.spec.svelte.js`, in a new `describe('onlazyload + loadMore')` block at the end:

```js
describe('onlazyload + loadMore', () => {
	it('should call onlazyload with proxy raw on expand of lazy node', async () => {
		const onlazyload = vi.fn().mockResolvedValue([
			{ text: 'Child', value: 'c' }
		])

		const w = new LazyWrapper(
			[{ text: 'Root', value: 'r', children: true }],
			{},
			{
				onlazyload,
				createProxy: (raw, fields, key, level) =>
					new LazyProxyItem(raw, fields, key, level, async (value, rawItem) => {
						return onlazyload(rawItem)
					})
			}
		)

		w.first()
		w.expand()
		await new Promise((r) => setTimeout(r, 0))
		flushSync()

		expect(onlazyload).toHaveBeenCalledTimes(1)
		expect(onlazyload).toHaveBeenCalledWith(expect.objectContaining({ text: 'Root' }))
	})

	it('should append root items via loadMore()', async () => {
		const onlazyload = vi.fn().mockResolvedValue([
			{ text: 'D', value: 'd' },
			{ text: 'E', value: 'e' }
		])

		const w = new LazyWrapper(
			[
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			],
			{},
			{ onlazyload }
		)

		expect(w.flatView).toHaveLength(3)

		await w.loadMore()
		flushSync()

		expect(onlazyload).toHaveBeenCalledTimes(1)
		expect(onlazyload).toHaveBeenCalledWith() // no args
		expect(w.flatView).toHaveLength(5)
		expect(w.flatView[3].proxy.text).toBe('D')
		expect(w.flatView[3].key).toBe('3')
		expect(w.flatView[4].proxy.text).toBe('E')
		expect(w.flatView[4].key).toBe('4')
	})

	it('should preserve existing proxies after loadMore', async () => {
		const onlazyload = vi.fn().mockResolvedValue([{ text: 'New', value: 'n' }])
		const w = new LazyWrapper(
			[{ text: 'Old', value: 'o' }],
			{},
			{ onlazyload }
		)

		const original = w.flatView[0].proxy

		await w.loadMore()
		flushSync()

		expect(w.flatView[0].proxy).toBe(original) // stable reference
	})

	it('should do nothing in loadMore when no onlazyload callback', async () => {
		const w = new LazyWrapper([{ text: 'A', value: 'a' }])
		await w.loadMore() // no-op
		expect(w.flatView).toHaveLength(1)
	})
})
```

### Step 2: Add onlazyload + loadMore to LazyWrapper

**Modify:** `packages/states/src/lazy-wrapper.svelte.js`

In the constructor, store onlazyload:
```js
this.#onlazyload = options.onlazyload
```

Add private field:
```js
#onlazyload
```

Add loadMore method:
```js
/**
 * Load more root items by calling onlazyload() with no arguments.
 * Appends results to the ProxyTree.
 */
async loadMore() {
	if (!this.#onlazyload) return
	const result = await this.#onlazyload()
	if (Array.isArray(result) && result.length > 0) {
		this.#proxyTree.append(result)
	}
}
```

### Step 3: Run tests

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states spec/lazy-wrapper.spec.svelte.js`
Expected: PASS — all tests including new ones.

### Step 4: Commit

```bash
git add packages/states/src/lazy-wrapper.svelte.js packages/states/spec/lazy-wrapper.spec.svelte.js
git commit -m "feat(states): add onlazyload callback + loadMore() to LazyWrapper

loadMore() calls onlazyload() (no args) for root pagination.
proxyTree.append() adds new items with correct keys."
```

---

## Task 4: Update LazyTree component — `onlazyload`, `hasMore`, Load More button

Rename `onloadchildren` → `onlazyload` in LazyTree. Add `hasMore` prop and "Load More" button. Wire the callback through to LazyWrapper.

**Files:**
- Modify: `packages/ui/src/components/LazyTree.svelte`

### Step 1: Update LazyTree props and wiring

Replace `onloadchildren` prop with `onlazyload`. Add `hasMore` prop. Pass `onlazyload` through to both the LazyProxyItem factory and LazyWrapper options.

Changes to script section:
- `onloadchildren` → `onlazyload` in props
- Add `hasMore = false` prop
- Pass `onlazyload` into LazyWrapper constructor options
- Add `handleLoadMore` async function that calls `wrapper.loadMore()`

Changes to template:
- After the `{#each}` block, add Load More button when `hasMore` is true

```svelte
{#if hasMore}
	<button
		type="button"
		data-tree-load-more
		onclick={handleLoadMore}
	>
		Load More
	</button>
{/if}
```

The `handleLoadMore` function:
```js
async function handleLoadMore() {
	await wrapper.loadMore()
}
```

### Step 2: Run Tree UI tests

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project ui spec/Tree.spec.svelte.ts`
Expected: PASS — Tree is unchanged, LazyTree has no tests yet.

### Step 3: Run full test suite

Run: `cd /Users/Jerry/Developer/rokkit/solution && npx vitest run --project states && npx vitest run --project ui`
Expected: PASS — all tests across both packages.

### Step 4: Commit

```bash
git add packages/ui/src/components/LazyTree.svelte
git commit -m "feat(ui): LazyTree onlazyload + hasMore + Load More button

Rename onloadchildren → onlazyload. Add hasMore prop that renders
a Load More button after tree items. Button calls wrapper.loadMore()
for root pagination."
```

---

## Task 5: Update playground and learn site pages

Update the LazyTree playground page and learn site to use `onlazyload` instead of `onloadchildren`. Verify pages build.

**Files:**
- Modify: `sites/playground/src/routes/components/lazy-tree/+page.svelte`
- Modify: `sites/learn/src/routes/(learn)/components/lazy-tree/intro/App.svelte`
- Modify: `sites/learn/src/routes/(learn)/components/lazy-tree/nested/App.svelte`
- Modify: `sites/learn/src/routes/(learn)/components/lazy-tree/fragments/02-load-function.js`
- Modify: `sites/learn/src/routes/docs/components/lazy-tree/llms.txt/+server.ts` (if it references old prop name)

### Step 1: Update all references from `onloadchildren` to `onlazyload`

In each file, rename `onloadchildren` → `onlazyload` in the component usage. Add `hasMore` demo where relevant (playground page).

### Step 2: Build learn site

Run: `cd /Users/Jerry/Developer/rokkit/solution/sites/learn && bun run build`
Expected: Build succeeds.

### Step 3: Build playground

Run: `cd /Users/Jerry/Developer/rokkit/solution/sites/playground && bun run build`
Expected: Build succeeds.

### Step 4: Commit

```bash
git add sites/
git commit -m "docs: update LazyTree pages for onlazyload + hasMore API

Rename onloadchildren → onlazyload in playground and learn site.
Add hasMore demo to playground page."
```

---

## Task 6: Run full verification

### Step 1: Run all tests

Run: `cd /Users/Jerry/Developer/rokkit/solution && bun run test:ci`
Expected: All tests pass (existing count + new ProxyTree tests).

### Step 2: Run lint

Run: `cd /Users/Jerry/Developer/rokkit/solution && bun run lint`
Expected: 0 errors.

### Step 3: Build both sites

Run: `cd /Users/Jerry/Developer/rokkit/solution/sites/learn && bun run build`
Run: `cd /Users/Jerry/Developer/rokkit/solution/sites/playground && bun run build`
Expected: Both build successfully.

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `packages/states/src/proxy-tree.svelte.js` | CREATE | ProxyTree class with flatView, lookup, append, addChildren |
| `packages/states/spec/proxy-tree.spec.svelte.js` | CREATE | ProxyTree unit tests |
| `packages/states/src/lazy-wrapper.svelte.js` | MODIFY | Delegate to ProxyTree, add onlazyload + loadMore() |
| `packages/states/spec/lazy-wrapper.spec.svelte.js` | MODIFY | Add onlazyload + loadMore tests |
| `packages/states/src/index.js` | MODIFY | Export ProxyTree |
| `packages/states/spec/index.spec.js` | MODIFY | Verify ProxyTree export |
| `packages/ui/src/components/LazyTree.svelte` | MODIFY | onlazyload, hasMore, Load More button |
| `sites/playground/…/lazy-tree/+page.svelte` | MODIFY | Use onlazyload |
| `sites/learn/…/lazy-tree/…` | MODIFY | Use onlazyload |
