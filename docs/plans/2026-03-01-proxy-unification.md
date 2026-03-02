# ProxyItem Unification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate the legacy `ItemProxy` (ui) and `Proxy` (states) classes, making `ProxyItem` the single proxy abstraction across the entire library.

**Architecture:** Replace all 8 ItemProxy-using components with ProxyItem from `@rokkit/states`. ProxyItem already has optional `key`/`level` defaults, and `normalizeFields()` handles legacy field keys (`text→label`, `description→subtext`). Delete the legacy Proxy class (testbed-only, Ramda dependency).

**Tech Stack:** Svelte 5, `@rokkit/states` ProxyItem, `@rokkit/core` BASE_FIELDS/normalizeFields

---

## Context for Implementer

### API Mapping (ItemProxy → ProxyItem)

Components currently use ItemProxy getters. Here is the exact mapping:

| ItemProxy getter | ProxyItem equivalent | Notes |
|---|---|---|
| `proxy.text` | `proxy.label` | BASE_FIELDS.label maps to raw 'text' |
| `proxy.itemValue` | `proxy.value` | BASE_FIELDS.value maps to raw 'value' |
| `proxy.icon` | `proxy.get('icon')` | Falls through to raw 'icon' key |
| `proxy.description` | `proxy.get('subtext')` | BASE_FIELDS.subtext maps to raw 'description' |
| `proxy.shortcut` | `proxy.get('shortcut')` | Falls through to raw 'shortcut' key |
| `proxy.label` (ARIA) | `proxy.label` | Same |
| `proxy.disabled` | `proxy.disabled` | Same |
| `proxy.active` | `proxy.get('active')` | No BASE_FIELDS entry; raw-key fallback works |
| `proxy.itemType` | `proxy.type` | Returns 'separator'/'spacer'/'group'/'item' |
| `proxy.has(field)` | `proxy.get(field) != null` | ProxyItem has no `.has()` |
| `proxy.get(field)` | `proxy.get(field)` | Same |
| `proxy.snippetName` | `proxy.get('snippet')` | |
| `proxy.original` | `proxy.original` | Same |
| `proxy.fields` | `proxy.fields` | Task 1 adds this getter to ProxyItem |
| `proxy.hasChildren` | `proxy.hasChildren` | Same |

### ProxyItem Constructor

```js
constructor(raw, fields = {}, key = '', level = 0)
```

- `raw`: Object or primitive (string/number) — primitives auto-normalize to `{ text: raw, value: raw }`
- `fields`: User field overrides — `normalizeFields()` auto-converts legacy keys (`text→label`, `description→subtext`)
- `key`, `level`: Optional, default to `''` and `0` — only meaningful for tree/list contexts

### Field Mapping Backward Compatibility

`normalizeFields()` in `@rokkit/core` has `LEGACY_KEY_MAP`:
```js
{ text: 'label', description: 'subtext', title: 'tooltip', image: 'avatar', target: 'hrefTarget' }
```

Users passing `fields = { text: 'name' }` → auto-converted to `{ label: 'name' }`. No breaking change for consumers.

---

### Task 1: Add `fields` getter to ProxyItem

Toolbar and FloatingAction pass `proxy.fields` to custom snippet renderers. ProxyItem needs a public getter.

**Files:**
- Modify: `solution/packages/states/src/proxy-item.svelte.js`
- Test: `solution/packages/states/spec/proxy-item.spec.svelte.js`

**Step 1: Write the failing test**

In `solution/packages/states/spec/proxy-item.spec.svelte.js`, add inside the existing `describe('ProxyItem', ...)`:

```js
it('exposes fields config via getter', () => {
	const item = { name: 'Test', id: 1 }
	const proxy = new ProxyItem(item, { label: 'name', value: 'id' })
	const fields = proxy.fields
	expect(fields.label).toBe('name')
	expect(fields.value).toBe('id')
	// Default fields preserved
	expect(fields.icon).toBe('icon')
	expect(fields.children).toBe('children')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/states/spec/proxy-item.spec.svelte.js`
Expected: FAIL — `proxy.fields` is undefined

**Step 3: Write minimal implementation**

In `solution/packages/states/src/proxy-item.svelte.js`, after the `get original()` getter (line ~141), add:

```js
/** The merged field-mapping configuration. */
get fields() {
	return this.#fields
}
```

**Step 4: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/states/spec/proxy-item.spec.svelte.js`
Expected: PASS

**Step 5: Commit**

```bash
git add solution/packages/states/src/proxy-item.svelte.js solution/packages/states/spec/proxy-item.spec.svelte.js
git commit -m "feat(states): add fields getter to ProxyItem for snippet compat"
```

---

### Task 2: Migrate BreadCrumbs to ProxyItem

**Files:**
- Modify: `solution/packages/ui/src/components/BreadCrumbs.svelte`
- Test: `solution/packages/ui/spec/BreadCrumbs.spec.svelte.ts`

**Step 1: Update the import and proxy creation**

In `BreadCrumbs.svelte`:

Replace line 3:
```ts
import { ItemProxy, type ItemFields } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

Replace the `createProxy` function (line 29-31):
```ts
function createProxy(item: unknown): ItemProxy {
	return new ItemProxy(item as Record<string, unknown>, fields)
}
```
With:
```ts
function createProxy(item: unknown): ProxyItem {
	return new ProxyItem(item, fields)
}
```

Replace `handleClick` (line 33-35):
```ts
function handleClick(proxy: ItemProxy) {
	onclick?.(proxy.itemValue, proxy.original)
}
```
With:
```ts
function handleClick(proxy: ProxyItem) {
	onclick?.(proxy.value, proxy.original)
}
```

In the interface, change `Partial<ItemFields>` to `Record<string, string>`:
```ts
fields?: Record<string, string>
```

Update the `crumb` snippet type from `Snippet<[ItemProxy, boolean]>` to `Snippet<[ProxyItem, boolean]>`:
```ts
crumb?: Snippet<[ProxyItem, boolean]>
```

Update the `defaultCrumb` snippet definition:
```svelte
{#snippet defaultCrumb(proxy: ProxyItem, _isLast: boolean)}
```

In the template, replace getter calls:
- `proxy.icon` → `proxy.get('icon')`
- `proxy.text` → `proxy.label`

The `defaultCrumb` snippet becomes:
```svelte
{#snippet defaultCrumb(proxy: ProxyItem, _isLast: boolean)}
	{#if proxy.get('icon')}
		<span data-breadcrumb-icon class={proxy.get('icon')} aria-hidden="true"></span>
	{/if}
	<span data-breadcrumb-label>{proxy.label}</span>
{/snippet}
```

**Step 2: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/BreadCrumbs.spec.svelte.ts`
Expected: PASS (16 tests)

**Step 3: Commit**

```bash
git add solution/packages/ui/src/components/BreadCrumbs.svelte
git commit -m "refactor(ui): migrate BreadCrumbs from ItemProxy to ProxyItem"
```

---

### Task 3: Migrate Timeline to ProxyItem

**Files:**
- Modify: `solution/packages/ui/src/components/Timeline.svelte`
- Test: `solution/packages/ui/spec/Timeline.spec.svelte.ts`

**Step 1: Update the import**

Replace line 4:
```ts
import { ItemProxy } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

**Step 2: Update the template**

In the each loop (line 20), replace:
```svelte
{@const proxy = new ItemProxy(item, fields)}
{@const text = proxy.text}
{@const icon = proxy.icon}
{@const description = proxy.description}
```
With:
```svelte
{@const proxy = new ProxyItem(item, fields)}
{@const text = proxy.label}
{@const icon = proxy.get('icon')}
{@const description = proxy.get('subtext')}
```

**Step 3: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/Timeline.spec.svelte.ts`
Expected: PASS (21 tests)

**Step 4: Commit**

```bash
git add solution/packages/ui/src/components/Timeline.svelte
git commit -m "refactor(ui): migrate Timeline from ItemProxy to ProxyItem"
```

---

### Task 4: Migrate Toolbar to ProxyItem

Most complex migration — has custom snippets, ListController integration, navigator.

**Files:**
- Modify: `solution/packages/ui/src/components/Toolbar.svelte`
- Test: `solution/packages/ui/spec/Toolbar.spec.svelte.ts`

**Step 1: Update the import**

Replace line 9:
```ts
import { ItemProxy } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

Also update `ListController` import if not already there (it's on line 10).

**Step 2: Update the createProxy function**

Replace (line 36-38):
```ts
function createProxy(item: ToolbarItem): ItemProxy {
	return new ItemProxy(item, userFields)
}
```
With:
```ts
function createProxy(item: ToolbarItem): ProxyItem {
	return new ProxyItem(item, userFields)
}
```

**Step 3: Update isInteractive**

Replace `proxy.itemType` → `proxy.type`:
```ts
function isInteractive(item: ToolbarItem): boolean {
	const proxy = createProxy(item)
	const type = proxy.type
	return type !== 'separator' && type !== 'spacer'
}
```

**Step 4: Update handleSelectAction**

Replace `createProxy(proxy.value)` with `createProxy(proxy.value)` — note: the ListController's proxy here is a different ProxyItem (from the controller). We need the raw item:
```ts
function handleSelectAction() {
	const key = controller.focusedKey
	if (!key) return
	const proxy = controller.lookup.get(key)
	if (!proxy) return
	const itemProxy = createProxy(proxy.value)
	handleItemClick(itemProxy)
}
```
This already works since `proxy.value` returns the raw item.

**Step 5: Update all handler functions**

Replace all `ItemProxy` type annotations with `ProxyItem`:
```ts
function handleItemClick(proxy: ProxyItem) {
	if (proxy.disabled || disabled) return
	onclick?.(proxy.value, proxy.original as ToolbarItem)
}

function handleItemKeyDown(event: KeyboardEvent, proxy: ProxyItem) { ... }

function createHandlers(proxy: ProxyItem): ToolbarItemHandlers { ... }

function resolveItemSnippet(proxy: ProxyItem): ToolbarItemSnippet | null {
	const snippetName = proxy.get('snippet')
	if (snippetName) { ... }
	return itemSnippet ?? null
}
```

**Step 6: Update the template snippets**

In `defaultItem` snippet:
```svelte
{#snippet defaultItem(proxy: ProxyItem, pathKey: string | undefined)}
	<button
		type="button"
		data-toolbar-item
		data-path={pathKey}
		data-active={proxy.get('active') || undefined}
		data-disabled={proxy.disabled || undefined}
		disabled={proxy.disabled || disabled}
		aria-label={proxy.label}
		aria-pressed={proxy.get('active')}
		title={proxy.get('shortcut') ? `${proxy.label} (${proxy.get('shortcut')})` : proxy.label}
	>
		{#if proxy.get('icon')}
			<span data-toolbar-icon class={proxy.get('icon')} aria-hidden="true"></span>
		{/if}
		{#if proxy.label && !proxy.get('icon')}
			<span data-toolbar-label>{proxy.label}</span>
		{/if}
	</button>
{/snippet}
```

In `renderItem` snippet:
```svelte
{#snippet renderItem(proxy: ProxyItem, item: ToolbarItem)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{@const itemType = proxy.type}
	{@const pathKey = getPathKey(item)}
	...
	{:else if customSnippet}
		<div data-toolbar-item-custom data-path={pathKey} data-disabled={proxy.disabled || undefined}>
			<svelte:boundary>
				{@render customSnippet(proxy.original as ToolbarItem, proxy.fields, handlers)}
				...
```

**Step 7: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/Toolbar.spec.svelte.ts`
Expected: PASS (37 tests)

**Step 8: Commit**

```bash
git add solution/packages/ui/src/components/Toolbar.svelte
git commit -m "refactor(ui): migrate Toolbar from ItemProxy to ProxyItem"
```

---

### Task 5: Migrate FloatingAction to ProxyItem

**Files:**
- Modify: `solution/packages/ui/src/components/FloatingAction.svelte`
- Test: `solution/packages/ui/spec/FloatingAction.spec.svelte.ts`

**Step 1: Update the import**

Replace line 9:
```ts
import { ItemProxy } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

**Step 2: Update createProxy**

```ts
function createProxy(item: FloatingActionItem): ProxyItem {
	return new ProxyItem(item, userFields)
}
```

**Step 3: Update all handler functions and type annotations**

Replace all `ItemProxy` type references with `ProxyItem`:
- `handleItemClick(item: { proxy: ProxyItem; original: FloatingActionItem })`
- `handleItemKeyDown(event, item: { proxy: ProxyItem; ... })`
- `createHandlers(item: { proxy: ProxyItem; ... })`
- `resolveItemSnippet(proxy: ProxyItem)`

Update getter calls:
- `item.proxy.disabled` → stays same
- `item.proxy.itemValue` → `item.proxy.value`
- `proxy.label || proxy.text` → `proxy.label`
- `proxy.icon` → `proxy.get('icon')`
- `proxy.text` → `proxy.label`
- `proxy.disabled` → stays same
- `proxy.snippetName` → `proxy.get('snippet')`
- `item.proxy.fields` → works (after Task 1)

**Step 4: Update template snippets**

In `defaultItem`:
```svelte
{#snippet defaultItem(
	proxy: ProxyItem,
	handlers: FloatingActionItemHandlers,
	index: number,
	total: number
)}
	<button
		type="button"
		data-fab-item
		data-fab-index={index}
		data-disabled={proxy.disabled || undefined}
		disabled={proxy.disabled || disabled}
		aria-label={proxy.label}
		style="--fab-index: {index}; --fab-total: {total}; --fab-delay: {getItemDelay(index)}"
		onclick={handlers.onclick}
		onkeydown={handlers.onkeydown}
	>
		{#if proxy.get('icon')}
			<span data-fab-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
		{/if}
		{#if proxy.label}
			<span data-fab-item-label>{proxy.label}</span>
		{/if}
	</button>
{/snippet}
```

In `renderItem`:
```svelte
{#snippet renderItem(
	item: { proxy: ProxyItem; original: FloatingActionItem },
	index: number,
	total: number
)}
```

**Step 5: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/FloatingAction.spec.svelte.ts`
Expected: PASS (34 tests)

**Step 6: Commit**

```bash
git add solution/packages/ui/src/components/FloatingAction.svelte
git commit -m "refactor(ui): migrate FloatingAction from ItemProxy to ProxyItem"
```

---

### Task 6: Migrate FloatingNavigation to ProxyItem

**Files:**
- Modify: `solution/packages/ui/src/components/FloatingNavigation.svelte`
- Test: `solution/packages/ui/spec/FloatingNavigation.spec.svelte.ts`

**Step 1: Update the import**

Replace line 3:
```ts
import { ItemProxy } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

**Step 2: Update itemProxies derivation**

Replace (line 27-32):
```ts
const itemProxies = $derived(
	items.map((item) => ({
		proxy: new ItemProxy(item, userFields),
		original: item
	}))
)
```
With:
```ts
const itemProxies = $derived(
	items.map((item) => ({
		proxy: new ProxyItem(item, userFields),
		original: item
	}))
)
```

**Step 3: Update activeIndex**

Replace `item.proxy.itemValue` → `item.proxy.value`:
```ts
const activeIndex = $derived(
	itemProxies.findIndex((item) => item.proxy.value === value)
)
```

**Step 4: Update handleItemClick**

Replace type annotation and getter calls:
```ts
function handleItemClick(item: { proxy: ProxyItem; original: Record<string, unknown> }) {
	value = item.proxy.value
	onselect?.(item.proxy.value, item.original)
	...
}
```

Replace `item.proxy.has('href')` → `item.proxy.get('href') != null`:
```ts
const href = item.proxy.get('href') != null
	? String(item.original[userFields?.href ?? 'href'] ?? '')
	: ''
```

**Step 5: Update all template getter calls**

Throughout the template:
- `item.proxy.itemValue` → `item.proxy.value`
- `item.proxy.has('href')` → `item.proxy.get('href') != null`
- `item.proxy.icon` → `item.proxy.get('icon')`
- `item.proxy.text` → `item.proxy.label`

**Step 6: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/FloatingNavigation.spec.svelte.ts`
Expected: PASS (34 tests)

**Step 7: Commit**

```bash
git add solution/packages/ui/src/components/FloatingNavigation.svelte
git commit -m "refactor(ui): migrate FloatingNavigation from ItemProxy to ProxyItem"
```

---

### Task 7: Migrate Button to ProxyItem

Prop-synthesis pattern — creates ProxyItem from component props.

**Files:**
- Modify: `solution/packages/ui/src/components/Button.svelte`
- Test: (Button tests exist within the test suite; run full UI tests)

**Step 1: Update the import**

Replace line 3:
```ts
import { ItemProxy } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

**Step 2: Update the proxy creation**

Replace (line 31-33):
```ts
const proxy = $derived(
	new ItemProxy({ text: label, icon, iconRight }, { text: 'text', icon: 'icon' })
)
```
With:
```ts
const proxy = $derived(
	new ProxyItem({ text: label, icon, iconRight })
)
```

Note: No field overrides needed — `{ text: label }` maps to `proxy.label` via BASE_FIELDS.label → 'text'. The `icon` field maps via BASE_FIELDS.icon → 'icon'. `iconRight` is accessed separately in the template (not via proxy), so no mapping needed.

**Step 3: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/`
Expected: PASS

**Step 4: Commit**

```bash
git add solution/packages/ui/src/components/Button.svelte
git commit -m "refactor(ui): migrate Button from ItemProxy to ProxyItem"
```

---

### Task 8: Migrate Pill to ProxyItem

**Files:**
- Modify: `solution/packages/ui/src/components/Pill.svelte`
- Test: `solution/packages/ui/spec/Pill.spec.svelte.ts`

**Step 1: Update the import and interface**

Replace line 3:
```ts
import { ItemProxy, type ItemFields } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

Update the interface:
```ts
interface PillProps {
	value: unknown
	fields?: Record<string, string>
	removable?: boolean
	disabled?: boolean
	onremove?: (value: unknown) => void
	content?: Snippet<[ProxyItem]>
	class?: string
}
```

**Step 2: Simplify the proxy creation**

Replace (line 33-38):
```ts
const proxy = $derived(
	new ItemProxy(
		typeof value === 'string' ? { text: value, value } : (value as Record<string, unknown>),
		fields
	)
)
```
With:
```ts
const proxy = $derived(new ProxyItem(value, fields))
```

ProxyItem handles primitives natively — strings auto-normalize to `{ text: value, value: value }`.

**Step 3: Update template getter calls**

Replace:
- `proxy.icon` → `proxy.get('icon')`
- `proxy.text` → `proxy.label`

```svelte
{#if proxy.get('icon')}
	<span data-pill-icon class={proxy.get('icon')} aria-hidden="true"></span>
{/if}
<span data-pill-text>{proxy.label}</span>
...
aria-label="Remove {proxy.label}"
```

**Step 4: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/Pill.spec.svelte.ts`
Expected: PASS (16 tests)

**Step 5: Commit**

```bash
git add solution/packages/ui/src/components/Pill.svelte
git commit -m "refactor(ui): migrate Pill from ItemProxy to ProxyItem"
```

---

### Task 9: Migrate Switch to ProxyItem

**Files:**
- Modify: `solution/packages/ui/src/components/Switch.svelte`
- Test: `solution/packages/ui/spec/Switch.spec.svelte.ts`

**Step 1: Update the import**

Replace line 3:
```ts
import { ItemProxy } from '../types/item-proxy.js'
```
With:
```ts
import { ProxyItem } from '@rokkit/states'
```

**Step 2: Update proxy creation**

Replace (line 18-19):
```ts
let offProxy = $derived(new ItemProxy(options[0] as Record<string, unknown>, userFields))
let onProxy = $derived(new ItemProxy(options[1] as Record<string, unknown>, userFields))
```
With:
```ts
let offProxy = $derived(new ProxyItem(options[0], userFields))
let onProxy = $derived(new ProxyItem(options[1], userFields))
```

**Step 3: Update getter references**

Replace `onProxy.itemValue` → `onProxy.value`:
```ts
let isChecked = $derived(value === onProxy.value)
```

Replace in `toggle()`:
```ts
function toggle() {
	if (disabled) return
	const next = isChecked ? offProxy : onProxy
	const nextValue = next.value
	value = nextValue
	onchange?.(nextValue, next.original as SwitchItem)
}
```

Replace template references:
- `currentProxy.text` → `currentProxy.label`
- `currentProxy.description` → `currentProxy.get('subtext')`
- `currentProxy.icon` → `currentProxy.get('icon')`

```svelte
aria-label={currentProxy.label || undefined}
title={currentProxy.get('subtext') ?? currentProxy.label ?? undefined}
...
{#if currentProxy.get('icon')}
	<span data-switch-icon class={currentProxy.get('icon')} aria-hidden="true"></span>
{/if}
...
{#if showLabels && currentProxy.label}
	<span data-switch-label>{currentProxy.label}</span>
{/if}
```

**Step 4: Run tests**

Run: `cd solution && npx vitest run packages/ui/spec/Switch.spec.svelte.ts`
Expected: PASS (27 tests)

**Step 5: Commit**

```bash
git add solution/packages/ui/src/components/Switch.svelte
git commit -m "refactor(ui): migrate Switch from ItemProxy to ProxyItem"
```

---

### Task 10: Delete ItemProxy and clean up types

All 8 components migrated. Now remove the dead class and update type files.

**Files:**
- Delete: `solution/packages/ui/src/types/item-proxy.ts`
- Modify: `solution/packages/ui/src/types/index.ts` (remove re-export)
- Modify: `solution/packages/ui/src/types/tree.ts` (remove ItemProxy import, update getNodeKey)
- Test: `solution/packages/ui/spec/ItemProxy.spec.svelte.ts` (delete)

**Step 1: Update tree.ts**

Replace line 10:
```ts
import type { ItemProxy, ItemFields } from './item-proxy.js'
```
With:
```ts
import type { ProxyItem } from '@rokkit/states'
```

Replace `TreeFields extends ItemFields` — since ItemFields is removed, define fields inline or simplify:
```ts
export interface TreeFields extends Record<string, string> {
	expanded?: string
	level?: string
}
```

Update `getNodeKey` (line ~254):
```ts
export function getNodeKey(proxy: ProxyItem): string {
	const val = proxy.value
	return typeof val === 'string' || typeof val === 'number' ? String(val) : proxy.label
}
```

**Step 2: Remove ItemProxy re-export from types/index.ts**

Remove line 32:
```ts
// Item Proxy
export * from './item-proxy.js'
```

**Step 3: Delete the ItemProxy file**

```bash
rm solution/packages/ui/src/types/item-proxy.ts
```

**Step 4: Delete ItemProxy spec**

```bash
rm solution/packages/ui/spec/ItemProxy.spec.svelte.ts
```

**Step 5: Run full UI tests**

Run: `cd solution && npx vitest run packages/ui/spec/`
Expected: All passing (minus the deleted ItemProxy spec)

**Step 6: Commit**

```bash
git add -A solution/packages/ui/src/types/ solution/packages/ui/spec/
git commit -m "refactor(ui): delete ItemProxy class and clean up type exports"
```

---

### Task 11: Delete legacy Proxy and migrate testbed

**Files:**
- Delete: `solution/packages/states/src/proxy.svelte.js`
- Delete: `solution/packages/states/spec/proxy.spec.svelte.js`
- Modify: `solution/packages/states/src/index.js` (remove Proxy export)
- Modify: `solution/packages/testbed/src/proxy/proxy.spec.svelte.js` (uses ProxyItem already — verify)

**Step 1: Check testbed proxy spec**

The testbed `proxy.spec.svelte.js` imports from `./proxy.svelte.js` in the testbed directory. Verify it tests ProxyItem (not the states Proxy). If it imports the states Proxy, migrate to ProxyItem.

**Step 2: Remove Proxy export from states/index.js**

Remove line 2:
```js
export { Proxy } from './proxy.svelte.js'
```

**Step 3: Delete the Proxy file**

```bash
rm solution/packages/states/src/proxy.svelte.js
```

**Step 4: Delete states Proxy spec**

```bash
rm solution/packages/states/spec/proxy.spec.svelte.js
```

**Step 5: Run full test suite**

Run: `cd solution && bun run test:ci`
Expected: All tests pass (minus deleted specs)

**Step 6: Commit**

```bash
git add -A solution/packages/states/ solution/packages/testbed/
git commit -m "refactor(states): delete legacy Proxy class (Ramda dependency removed)"
```

---

### Task 12: Final verification and project file updates

**Step 1: Run full test suite**

Run: `cd solution && bun run test:ci`
Expected: All passing

**Step 2: Run lint**

Run: `cd solution && bun run lint`
Expected: 0 errors

**Step 3: Update project files**

- Update `agents/plan.md` — mark backlog #3 complete
- Update `agents/journal.md` — log completion with commit hashes
- Update `docs/backlog/2026-03-01-ui-components.md` — mark #3 DONE

**Step 4: Commit**

```bash
git add agents/ docs/backlog/
git commit -m "docs: mark ProxyItem unification (backlog #3) complete"
```
