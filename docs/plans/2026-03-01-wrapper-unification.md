# ProxyTree + Wrapper Unification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify Wrapper and LazyWrapper so Wrapper accepts ProxyTree, LazyWrapper extends Wrapper (no duplication), and components create ProxyTree externally. Replace `showLines` with `lineStyle`.

**Architecture:** Components create `ProxyTree(items, fields)`, pass it to `Wrapper(proxyTree, opts)`. LazyWrapper extends Wrapper, overriding only expand/select/toggle for lazy loading. Dead static pipeline (`buildProxyList`/`buildFlatView`/`AbstractWrapper`) is removed.

**Tech Stack:** Svelte 5 ($state/$derived), Vitest, CSS data attributes

---

## Task 1: Refactor Wrapper to Accept ProxyTree

**Files:**
- Modify: `packages/states/src/wrapper.svelte.js`
- Test: `packages/testbed/src/wrapper/wrapper.spec.svelte.js`

**Step 1: Update Wrapper constructor**

Change the constructor from `(items, fields, options)` to `(proxyTree, options)`. Remove `buildProxyList`/`buildFlatView` imports. Read `flatView` and `lookup` from the ProxyTree instance.

```js
import { ProxyTree } from './proxy-tree.svelte.js'

export class Wrapper {
  #proxyTree
  flatView = $derived(this.#proxyTree.flatView)
  #navigable = $derived(this.flatView.filter(n => n.type !== 'separator' && n.type !== 'spacer' && !n.proxy.disabled))
  #focusedKey = $state(null)
  #onselect; #onchange; #selectedValue = $state(undefined)

  constructor(proxyTree, options = {}) {
    this.#proxyTree = proxyTree
    this.#onselect = options.onselect
    this.#onchange = options.onchange
  }

  get focusedKey() { return this.#focusedKey }
  get lookup() { return this.#proxyTree.lookup }
  get proxyTree() { return this.#proxyTree }

  // ... all navigation methods unchanged (next, prev, first, last, expand, collapse, select, toggle, moveTo, moveToValue, findByText, cancel, blur, extend, range)
}
```

Key changes:
- Remove `extends AbstractWrapper` — Wrapper is now the base class
- Remove `import { buildProxyList, buildFlatView }`
- Remove `#lookup` and `#roots` private fields
- `flatView` reads from `this.#proxyTree.flatView` (not `buildFlatView(this.#roots)`)
- `get lookup()` delegates to `this.#proxyTree.lookup`
- Add `get proxyTree()` accessor
- All navigation methods stay exactly the same — they read `this.flatView` and `this.#navigable` which are already `$derived`

**Step 2: Update testbed Wrapper tests**

The testbed has its own local Wrapper copy at `packages/testbed/src/wrapper/wrapper.svelte.js`. Update that copy to match. Update the spec to create `ProxyTree` before `Wrapper`:

```js
import { ProxyTree } from '@rokkit/states'

// Before:
const w = new Wrapper(flat)
// After:
const w = new Wrapper(new ProxyTree(flat))

// With fields:
const w = new Wrapper(new ProxyTree(items, { label: 'name' }))

// With options:
const w = new Wrapper(new ProxyTree(items), { onselect: vi.fn() })
```

Note: `flushSync` may be needed for `$derived` reads that go through ProxyTree — verify in tests.

**Step 3: Add Wrapper spec in states package**

Create `packages/states/spec/wrapper.spec.svelte.js` — port the testbed tests to import from `../src/wrapper.svelte.js` and `../src/proxy-tree.svelte.js`. This ensures the production Wrapper has its own tests (currently it only has testbed coverage).

**Step 4: Run tests, verify pass**

```bash
bun run test:ci
```

**Step 5: Commit**

```
feat(states): refactor Wrapper to accept ProxyTree
```

---

## Task 2: LazyWrapper Extends Wrapper

**Files:**
- Modify: `packages/states/src/lazy-wrapper.svelte.js`
- Test: `packages/states/spec/lazy-wrapper.spec.svelte.js`

**Step 1: Refactor LazyWrapper to extend Wrapper**

```js
import { Wrapper } from './wrapper.svelte.js'

export class LazyWrapper extends Wrapper {
  #onlazyload

  constructor(proxyTree, options = {}) {
    super(proxyTree, options)
    this.#onlazyload = options.onlazyload
  }

  // Override expand() — lazy sentinel detection
  expand(path) {
    const node = this.flatView.find(n => n.key === (path ?? this.focusedKey))
    if (!node) return
    if (!node.hasChildren && node.proxy.loaded === false) {
      node.proxy.fetch().then(() => { node.proxy.expanded = true })
      return
    }
    super.expand(path)
  }

  // Override select() — lazy sentinel detection
  select(path) {
    const key = path ?? this.focusedKey
    const node = this.flatView.find(n => n.key === key)
    if (node?.hasChildren || node?.isExpandable) {
      if (node.proxy.loaded === false) {
        node.proxy.fetch().then(() => { node.proxy.expanded = true })
        return
      }
    }
    super.select(path)
  }

  // Override toggle() — lazy sentinel detection
  toggle(path) {
    const key = path ?? this.focusedKey
    const node = this.flatView.find(n => n.key === key)
    if (node?.isExpandable && node.proxy.loaded === false) {
      node.proxy.fetch().then(() => { node.proxy.expanded = true })
      return
    }
    super.toggle(path)
  }

  async loadMore() {
    if (!this.#onlazyload) return
    const items = await this.#onlazyload()
    if (items?.length) this.proxyTree.append(items)
  }
}
```

Delete all duplicated methods: `next`, `prev`, `first`, `last`, `moveTo`, `moveToValue`, `cancel`, `blur`, `extend`, `range`, `findByText`, `collapse`, `#navigable`, `#focusedKey`, `#selectedValue`, `#onselect`, `#onchange`, and `flatView`/`lookup` getters.

**Step 2: Update LazyWrapper tests**

Change constructor calls from `new LazyWrapper(items, fields, opts)` to `new LazyWrapper(new ProxyTree(items, fields, opts), opts)`.

For lazy loading tests that use `createProxy`:
```js
const pt = new ProxyTree(items, fields, {
  createProxy: (raw, f, key, level) => new LazyProxyItem(raw, f, key, level, lazyLoad)
})
const w = new LazyWrapper(pt, { onselect, onlazyload })
```

**Step 3: Run tests, verify pass**

```bash
bun run test:ci
```

**Step 4: Commit**

```
refactor(states): LazyWrapper extends Wrapper, removes duplicated navigation
```

---

## Task 3: Migrate Flat Components (List, Menu, Select, MultiSelect, Toggle, Tabs)

**Files:**
- Modify: `packages/ui/src/components/List.svelte`
- Modify: `packages/ui/src/components/Menu.svelte`
- Modify: `packages/ui/src/components/Select.svelte`
- Modify: `packages/ui/src/components/MultiSelect.svelte`
- Modify: `packages/ui/src/components/Toggle.svelte`
- Modify: `packages/ui/src/components/Tabs.svelte`

**Step 1: Update imports in all 6 components**

Add `ProxyTree` import:
```js
import { Wrapper, ProxyTree } from '@rokkit/states'
```

**Step 2: Change construction pattern in each**

Replace:
```js
const wrapper = $derived(new Wrapper(items, fields, { onselect }))
```
With:
```js
const proxyTree = $derived(new ProxyTree(items, fields))
const wrapper = $derived(new Wrapper(proxyTree, { onselect }))
```

For each component specifically:

- **List:** `new ProxyTree(items, fields)` → `new Wrapper(proxyTree, { onselect })`
- **Menu:** `new ProxyTree(items, fields)` → `new Wrapper(proxyTree, { onselect: handleSelect })`; keep `$effect` cancel/blur overrides
- **Select:** `new ProxyTree(processedItems, fields)` → `new Wrapper(proxyTree, { onselect: handleSelect })`
- **MultiSelect:** `new ProxyTree(processedItems, fields)` → `new Wrapper(proxyTree, { onselect: handleSelect })`
- **Toggle:** `new ProxyTree(options, userFields)` → `new Wrapper(proxyTree, { onselect: handleSelect })`
- **Tabs:** `new ProxyTree(options, userFields)` → `new Wrapper(proxyTree, { onchange, onselect })`

**Step 3: Run UI tests**

```bash
bun run test:ui
```

**Step 4: Commit**

```
refactor(ui): migrate flat components to ProxyTree + Wrapper
```

---

## Task 4: Migrate Tree Components (Tree, LazyTree)

**Files:**
- Modify: `packages/ui/src/components/Tree.svelte`
- Modify: `packages/ui/src/components/LazyTree.svelte`

**Step 1: Update Tree.svelte**

Already uses `LazyWrapper`. Change:
```js
const wrapper = $derived(new LazyWrapper(items, fields, { onselect }))
```
To:
```js
const proxyTree = $derived(new ProxyTree(items, fields))
const wrapper = $derived(new LazyWrapper(proxyTree, { onselect }))
```

**Step 2: Update LazyTree.svelte**

Change:
```js
const wrapper = $derived(new LazyWrapper(items, fields, {
  onselect,
  onlazyload,
  createProxy: (raw, f, key, level) =>
    new LazyProxyItem(raw, f, key, level, ...)
}))
```
To:
```js
const proxyTree = $derived(new ProxyTree(items, fields, {
  createProxy: (raw, f, key, level) =>
    new LazyProxyItem(raw, f, key, level,
      onlazyload ? async (_value, rawItem) => onlazyload(rawItem) : null
    )
}))
const wrapper = $derived(new LazyWrapper(proxyTree, { onselect, onlazyload }))
```

**Step 3: Run all tests**

```bash
bun run test:ci
```

**Step 4: Commit**

```
refactor(ui): migrate Tree/LazyTree to ProxyTree + LazyWrapper
```

---

## Task 5: showLines → lineStyle

**Files:**
- Modify: `packages/ui/src/types/tree.ts`
- Modify: `packages/ui/src/components/Tree.svelte`
- Modify: `packages/ui/src/components/LazyTree.svelte`
- Modify: `packages/themes/src/base/tree.css`
- Test: `packages/ui/spec/Tree.spec.svelte.ts`

**Step 1: Update types**

In `packages/ui/src/types/tree.ts`, replace:
```ts
showLines?: boolean
```
With:
```ts
lineStyle?: 'none' | 'solid' | 'dashed' | 'dotted'
```

**Step 2: Update Tree.svelte**

Replace `showLines = true` prop with `lineStyle = 'solid'`.

On root element, replace `data-show-lines={showLines || undefined}` with `data-line-style={lineStyle}`.

In the template, replace `{#if showLines}` with `{#if lineStyle !== 'none'}`.

**Step 3: Update LazyTree.svelte**

Same changes as Tree.svelte.

**Step 4: Update tree.css**

Replace `[data-show-lines]` usage (if any) with `[data-line-style]`. Add border-style variants:

```css
/* Line style variants */
[data-tree][data-line-style='solid'] [data-connector-line] {
  border-style: solid;
}

[data-tree][data-line-style='dashed'] [data-connector-line] {
  border-style: dashed;
}

[data-tree][data-line-style='dotted'] [data-connector-line] {
  border-style: dotted;
}
```

Check what `Connector.svelte` renders to know the exact selector. The connector lines are likely styled via `border-left` or similar.

**Step 5: Update Tree tests**

Update any tests that assert on `data-show-lines` to use `data-line-style`. Update tests that pass `showLines` prop to pass `lineStyle`.

**Step 6: Run all tests**

```bash
bun run test:ci
```

**Step 7: Commit**

```
feat(ui): replace showLines boolean with lineStyle prop (none|solid|dashed|dotted)
```

---

## Task 6: Dead Code Cleanup

**Files:**
- Modify: `packages/states/src/wrapper.svelte.js` — remove backward compat constructor branch (instanceof ProxyTree detection and 3-arg legacy path)
- Modify: `packages/states/src/proxy-item.svelte.js` — remove `buildProxyList`, `buildFlatView` exports
- Delete: `packages/states/src/abstract-wrapper.js`
- Modify: `packages/states/src/index.js` — remove dead exports
- Modify: `packages/testbed/src/navigator/abstract-wrapper.spec.js` — delete or update if it imports AbstractWrapper

**Step 1: Remove `buildProxyList` and `buildFlatView` from proxy-item.svelte.js**

Keep the functions if they're used internally by tests or other code — but they should no longer be. Search for all usages first:

```bash
grep -r "buildProxyList\|buildFlatView" packages/ --include="*.js" --include="*.svelte" --include="*.ts"
```

If only imported from old Wrapper (now removed) and index.js, safe to delete.

**Step 2: Delete abstract-wrapper.js**

```bash
rm packages/states/src/abstract-wrapper.js
```

**Step 3: Update index.js exports**

Remove:
```js
export { AbstractWrapper }
export { buildProxyList, buildFlatView, PROXY_ITEM_FIELDS }
```

Keep:
```js
export { ProxyItem, LazyProxyItem, BASE_FIELDS }
```

**Step 4: Update testbed abstract-wrapper spec**

The file `packages/testbed/src/navigator/abstract-wrapper.spec.js` tests the AbstractWrapper interface. Either delete it or update it to test Wrapper as the base class.

**Step 5: Run all tests + lint**

```bash
bun run test:ci
bun run lint
```

**Step 6: Commit**

```
refactor(states): remove dead code (AbstractWrapper, buildProxyList, buildFlatView)
```

---

## Task 7: Update Project Files

**Files:**
- Modify: `agents/plan.md` — mark #75 complete
- Modify: `agents/journal.md` — log progress
- Modify: `docs/backlog/2026-03-01-ui-components.md` — mark #75 done

**Step 1: Update plan, journal, backlog**

**Step 2: Final commit**

```
docs: complete backlog #75 — ProxyTree + Wrapper unification
```
