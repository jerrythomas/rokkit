# Rokkit Component Blueprint

> Self-contained reference for building or editing `@rokkit/ui` components.
> Every rule here is enforced. Every pattern here is already proven in production.

---

## 1. Pick the Right Tier

| Tier | Pattern | Primitives used | When |
|------|---------|-----------------|------|
| 1 | Display only | — | No items, no interaction (Badge, Card, Message) |
| 2 | Data-driven display | `ProxyTree` | `items` array, click handlers, no keyboard nav (BreadCrumbs, Sparkline) |
| 3 | Persistent interactive list | `Wrapper` + `Navigator` | Always-visible, keyboard navigable list (List, Tree, Tabs, Toggle) |
| 4 | Dropdown / popup | `Wrapper` + `Trigger` + `Navigator` | Items in a popover that opens/closes (Select, Menu, Dropdown) |

**Decision rule:** Does it have an `items` array? → Tier 2+. Does it need keyboard navigation? → Tier 3+. Is it in a popup? → Tier 4.

---

## 2. Standard Props API

Every component follows this shape. Use exactly these names.

```ts
let {
  // Data
  items = [],            // Tier 2+: source data array
  fields = {},           // Field name mapping (see ProxyItem)
  value = $bindable(),   // Single selected value (extracted primitive)
  values = $bindable([]),// Multi-select: array of extracted primitives

  // Behavior
  disabled = false,
  selectable = true,     // or 'single' | 'multi' | false

  // Presentation
  size = 'md',           // 'sm' | 'md' | 'lg'
  class: className = '',

  // Callbacks
  onchange,              // (value, item) => void  — data components
  onselect,              // (value, item) => void  — list/tree components

  // Customization
  icons: userIcons = {},
  labels: userLabels = {},

  // Snippets (via ...snippets spread, see §7)
  ...snippets
} = $props()
```

**Rules:**
- `value` is always the **extracted primitive** (`item[fields.value]`), not the full object
- `onchange` for inputs/selectors, `onselect` for navigation/list components
- `icons` and `labels` are shallow-merged over defaults — always merge, never replace
- Callback second arg is the full original item object

---

## 3. Data-Attribute Conventions

**This is how CSS theming and tests target elements. Follow it exactly.**

```html
<!-- Root: single marker, no value -->
<div data-list>
<div data-select>
<div data-rating>

<!-- Parts: data-{component}-{role} -->
<div data-list-item>
<button data-select-trigger>
<div data-select-dropdown>
<span data-list-group-label>

<!-- Boolean state: presence = true, absence = false — NEVER "true"/"false" strings -->
<div data-list-item data-selected>         <!-- selected -->
<div data-list-item>                       <!-- not selected -->
<div data-select data-open>                <!-- open -->

<!-- Enumerated state: data-{attr}="value" -->
<div data-list data-size="md">
<div data-table-row data-sort-order="ascending">

<!-- Required for navigation: key must be stable and unique -->
<button data-path={entry.key}>
```

**In Svelte templates, use conditional undefined to toggle boolean attrs:**
```svelte
data-selected={isSelected || undefined}
data-open={isOpen || undefined}
data-disabled={disabled || undefined}
```

**CSS always selects by attribute, never by tag or class:**
```css
[data-list-item][data-selected] { ... }   /* correct */
.list-item.selected { ... }               /* forbidden */
li.active { ... }                         /* forbidden */
```

---

## 4. ProxyItem API

`ProxyItem` wraps a raw item through a field map. Components receive a `ProxyItem` in snippets and event callbacks.

```ts
proxy.label        // item[fields.label ?? 'label']  — display text
proxy.value        // item[fields.value ?? 'value']  — extracted primitive
proxy.icon         // item[fields.icon ?? 'icon']    — icon class string or null
proxy.disabled     // item[fields.disabled ?? 'disabled'] as boolean
proxy.hasChildren  // true if item has a non-empty children array
proxy.original     // the raw item object

proxy.get('field') // read any field by mapped or raw name
proxy.has('field') // true if field exists and is non-null/undefined
```

**Default field mapping** (`PROXY_ITEM_FIELDS`):
```js
{ label: 'label', value: 'value', icon: 'icon', href: 'href',
  children: 'children', type: 'type', disabled: 'disabled',
  expanded: 'expanded', snippet: 'snippet' }
```

**Note:** The text field maps to `label`, NOT `text`. Never assume `item.text`.

---

## 5. Primitives Reference

### 5a. ProxyTree (Tier 2+)

Wraps a flat or nested items array, applying field mapping. Use when you need `flatView` for rendering but don't need keyboard nav.

```js
import { ProxyTree } from '@rokkit/states'

const tree = $derived(new ProxyTree(items, fields))
// tree.flatView — flat array of { key, proxy, level, hasChildren, type }
// tree.lookup   — Map<key, proxy>
```

### 5b. Wrapper + Navigator (Tier 3 — persistent list)

```svelte
<script>
  // @ts-nocheck
  import { Wrapper, ProxyTree, messages } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'

  let { items = [], fields = {}, value = $bindable(), onselect, ...snippets } = $props()

  // handleSelect MUST be defined outside $derived — binding propagation requires it
  function handleSelect(extractedValue, proxy) {
    value = extractedValue
    onselect?.(extractedValue, proxy.original)
  }

  const tree = $derived(new ProxyTree(items, fields))
  const wrapper = $derived(new Wrapper(tree, { onselect: handleSelect }))

  let listRef = $state(null)

  // Navigator attaches to the DOM container; re-mounts when wrapper recreates
  $effect(() => {
    if (!listRef) return
    const nav = new Navigator(listRef, wrapper, {})
    return () => nav.destroy()
  })

  // Sync DOM focus to wrapper's focusedKey
  $effect(() => {
    const key = wrapper.focusedKey
    if (!listRef || !key) return
    const el = listRef.querySelector(`[data-path="${key}"]`)
    if (el && el !== document.activeElement) {
      el.focus()
      el.scrollIntoView?.({ block: 'nearest' })
    }
  })
</script>

<div bind:this={listRef} data-list>
  {#each wrapper.flatView as node (node.key)}
    {#if node.type === 'separator'}
      <hr data-list-separator />
    {:else if node.hasChildren}
      <div data-list-group data-path={node.key} role="group">
        <span data-list-group-label>{node.proxy.label}</span>
      </div>
    {:else}
      {@const isSelected = node.proxy.value === value}
      <button
        data-list-item
        data-path={node.key}
        data-selected={isSelected || undefined}
        data-disabled={node.proxy.disabled || undefined}
        disabled={node.proxy.disabled}
        tabindex={wrapper.focusedKey === node.key ? 0 : -1}
        role="option"
        aria-selected={isSelected}
      >
        <!-- default content or snippet -->
      </button>
    {/if}
  {/each}
</div>
```

**Navigator click interception:** Navigator intercepts ALL clicks on `[data-path]` elements and calls `wrapper.select()`. **Never add `onclick` to elements that also have `data-path`** — it fires twice. Handle post-select logic via the `onselect` callback passed to `Wrapper`.

### 5c. Wrapper + Trigger + Navigator (Tier 4 — dropdown)

```svelte
<script>
  import { Wrapper, ProxyTree } from '@rokkit/states'
  import { Navigator, Trigger } from '@rokkit/actions'

  let isOpen = $state(false)
  let rootRef = $state(null)
  let triggerRef = $state(null)
  let dropdownRef = $state(null)

  function handleSelect(v, proxy) {
    value = v
    onchange?.(v, proxy.original)
    isOpen = false
    triggerRef?.focus()
  }

  const tree = $derived(new ProxyTree(items, fields))
  const wrapper = $derived(new Wrapper(tree, { onselect: handleSelect }))

  // Override cancel (Escape) and blur (click-outside) to close
  $effect(() => {
    const w = wrapper
    w.cancel = () => { isOpen = false; triggerRef?.focus() }
    w.blur = () => { isOpen = false }
  })

  // Trigger manages open/close on the trigger button
  $effect(() => {
    if (!triggerRef || !rootRef || disabled) return
    const t = new Trigger(triggerRef, rootRef, {
      isOpen: () => isOpen,
      onopen: () => { isOpen = true; requestAnimationFrame(() => wrapper.first(null)) },
      onclose: () => { isOpen = false },
      onlast: () => requestAnimationFrame(() => wrapper.last(null))
    })
    return () => t.destroy()
  })

  // Navigator on the dropdown panel (only while open)
  $effect(() => {
    if (!isOpen || !dropdownRef) return
    const nav = new Navigator(dropdownRef, wrapper, {})
    return () => nav.destroy()
  })
</script>

<div bind:this={rootRef} data-select data-open={isOpen || undefined}>
  <button bind:this={triggerRef} data-select-trigger aria-haspopup="listbox" aria-expanded={isOpen}>
    <!-- trigger content -->
  </button>

  {#if isOpen}
    <div bind:this={dropdownRef} data-select-dropdown role="listbox">
      {#each wrapper.flatView as node (node.key)}
        <button data-select-option data-path={node.key} role="option" tabindex="-1">
          <!-- option content -->
        </button>
      {/each}
    </div>
  {/if}
</div>
```

### 5d. ListController (Tier 3 alternative — flat lists only)

Use `ListController` instead of `Wrapper` when:
- Items are flat (no tree/hierarchy needed)
- You need multi-select state management
- You need column-aware navigation (Table)

```js
import { TableController, ListController } from '@rokkit/states'
import { navigator } from '@rokkit/actions'  // Svelte action form

// ListController tracks selection + focus for flat lists
const controller = untrack(() => new ListController(data, { value, multiselect }))

// use:navigator action form (alternative to Navigator class)
// <div use:navigator={{ wrapper: controller, orientation: 'vertical' }}>
```

---

## 6. Messages Integration (i18n)

Every hardcoded user-visible string must come from `messages`.

```svelte
<script>
  import { messages } from '@rokkit/states'

  let { labels: userLabels } = $props()

  // Merge component's namespace with per-instance overrides
  const labels = $derived({ ...messages.list, ...userLabels })
</script>

<nav aria-label={labels.label}>
<button aria-label={messages.tree.expand}>
<span>{messages.loading}</span>
```

**Adding a new component namespace** — edit `packages/states/src/messages.svelte.js`:
```js
// In defaultMessages object:
myComponent: { label: 'My Component', action: 'Do thing' }

// In MessagesStore class:
myComponent = $state({ ...defaultMessages.myComponent })
```

**App-level translation:**
```js
messages.register('fr', { list: { label: 'Liste' }, tree: { expand: 'Ouvrir' } })
messages.setLocale('fr')
```

---

## 7. Snippet Customization

Every component with renderable items must support snippet override.

```svelte
<script>
  import { resolveSnippet, ITEM_SNIPPET, GROUP_SNIPPET } from '@rokkit/core'

  let { ...snippets } = $props()
</script>

{#snippet defaultItemContent(proxy)}
  {#if proxy.icon}<span class={proxy.icon} aria-hidden="true"></span>{/if}
  <span>{proxy.label}</span>
{/snippet}

<!-- In the each loop: -->
{@const content = resolveSnippet(snippets, proxy, ITEM_SNIPPET)}
{#if content}
  {@render content(proxy)}
{:else}
  {@render defaultItemContent(proxy)}
{/if}
```

`resolveSnippet(snippets, proxy, fallback)` checks:
1. `proxy.get('snippet')` → named snippet by item field
2. `fallback` constant (`ITEM_SNIPPET = 'item'`, `GROUP_SNIPPET = 'group'`)
3. Returns `undefined` if neither exists

**Consumer usage:**
```svelte
<MyList {items}>
  {#snippet item(proxy)}
    <span>{proxy.label}</span>
    <span class="badge">{proxy.get('count')}</span>
  {/snippet}
</MyList>
```

---

## 8. Theme CSS Structure

Every component needs two CSS files: **base** (layout) and **style files** (visual).

### base/`component-name`.css — structure only

```css
[data-component] {
  display: flex;
  flex-direction: column;
  gap: var(--density-gap-sm);
}

[data-component-item] {
  display: flex;
  align-items: center;
  padding-block: var(--density-spacing-sm);
  padding-inline: var(--density-spacing-md);
  cursor: pointer;
  border-radius: var(--density-radius-base);
}
```

**Use density tokens:** `var(--density-spacing-sm/md/lg)`, `var(--density-gap-*)`, `var(--density-radius-base)` — never hardcode `px` values for spacing.

### rokkit/`component-name`.css — gradients + glows

```css
[data-style='rokkit'] [data-component-item] {
  @apply bg-surface-z2 text-surface-z7;
}
[data-style='rokkit'] [data-component-item]:hover:not([data-disabled]) {
  @apply bg-surface-z3 text-surface-z9;
}
[data-style='rokkit'] [data-component-item][data-selected] {
  @apply from-primary-z5 to-secondary-z5 text-on-primary bg-gradient-to-b;
}
```

### minimal/`component-name`.css — flat + border indicators

```css
[data-style='minimal'] [data-component-item] {
  @apply text-surface-z7 bg-none;
}
[data-style='minimal'] [data-component-item]:hover:not([data-disabled]) {
  @apply border-l-2 border-l-secondary-z4 bg-none;
}
[data-style='minimal'] [data-component-item][data-selected] {
  @apply border-l-2 border-l-primary-z4 text-primary-z7 bg-none;
}
```

`bg-none` is **required** on every minimal/material/frosted rule that competes with rokkit gradients.

### After any CSS change — mandatory

```bash
cd packages/themes && bun run build
```

---

## 9. Gotchas

### Svelte 5 Reactivity through Maps

**Svelte 5 cannot track reactivity through a `$derived` Map → `proxy.expanded` ($state) in templates.**
If a `$derived` returns a `Map` and the template reads a `$state` property from a Map value, the template won't re-render. Fix: maintain a separate `$state<Record<string, boolean>>` synced after mutations.

```js
// Bad — template won't react to expanded changes via the Map
const lookup = $derived(new Map(items.map((item, i) => [i, new ItemProxy(item)])))

// Good — separate reactive record for template use
let expandedByKey = $state({})
function toggleExpanded(key) {
  expandedByKey = { ...expandedByKey, [key]: !expandedByKey[key] }
}
```

### handleSelect outside $derived

```js
// WRONG — binding propagation breaks
const wrapper = $derived(new Wrapper(tree, {
  onselect: (v) => { value = v }   // ← value assignment won't propagate to parent
}))

// CORRECT — define handler at component scope
function handleSelect(v, proxy) { value = v; onchange?.(v, proxy.original) }
const wrapper = $derived(new Wrapper(tree, { onselect: handleSelect }))
```

### scrollIntoView in JSDOM tests

```js
el.scrollIntoView?.({ block: 'nearest' })  // optional chaining — required for test compat
```

### Svelte 5 only — no legacy patterns

```js
// Forbidden                  // Correct
export let foo              → let { foo } = $props()
$: bar = x + 1             → const bar = $derived(x + 1)
on:click={handler}         → onclick={handler}
createEventDispatcher()    → callback props (onchange, onselect)
```

---

## 10. File Checklist

```
packages/ui/src/components/<Name>.svelte          ← component
packages/ui/src/components/index.ts               ← add export
packages/ui/src/index.ts                          ← add export
packages/themes/src/base/<name>.css               ← layout CSS
packages/themes/src/rokkit/<name>.css             ← theme CSS
packages/themes/src/minimal/<name>.css
packages/themes/src/material/<name>.css
packages/themes/src/frosted/<name>.css
  → import each in the theme's index.css
  → cd packages/themes && bun run build           ← MANDATORY

packages/ui/spec/<Name>.spec.svelte.ts            ← unit tests
site/e2e/<name>.e2e.ts                            ← e2e tests
site/src/routes/(play)/playground/components/<name>/+page.svelte
  → register in playground/+page.svelte GROUPS
site/src/routes/(learn)/docs/components/<name>/+page.svelte
site/src/routes/(learn)/docs/components/<name>/meta.json
docs/llms/components/<name>.txt                   ← LLM reference
```

---

## 11. Complete Tier 3 Example — `TagList`

A realistic minimal Tier 3 component (always-visible, keyboard navigable, removable tags):

```svelte
<!-- packages/ui/src/components/TagList.svelte -->
<script>
  // @ts-nocheck
  import { Wrapper, ProxyTree, messages } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'

  let {
    items = [],
    fields = {},
    value = $bindable(),
    disabled = false,
    onselect,
    onremove,
    class: className = '',
    ...snippets
  } = $props()

  function handleSelect(v, proxy) {
    if (disabled) return
    value = v
    onselect?.(v, proxy.original)
  }

  const tree = $derived(new ProxyTree(items, fields))
  const wrapper = $derived(new Wrapper(tree, { onselect: handleSelect }))

  let rootRef = $state(null)

  $effect(() => {
    if (!rootRef) return
    const nav = new Navigator(rootRef, wrapper, {})
    return () => nav.destroy()
  })

  $effect(() => {
    const key = wrapper.focusedKey
    if (!rootRef || !key) return
    const el = rootRef.querySelector(`[data-path="${key}"]`)
    if (el && el !== document.activeElement) el.focus()
  })
</script>

<div
  bind:this={rootRef}
  data-tag-list
  data-disabled={disabled || undefined}
  class={className || undefined}
  role="listbox"
  aria-label={messages.list.label}
>
  {#each wrapper.flatView as node (node.key)}
    {@const proxy = node.proxy}
    {@const isSelected = proxy.value === value}
    <span
      data-tag
      data-path={node.key}
      data-selected={isSelected || undefined}
      data-disabled={proxy.disabled || undefined}
      role="option"
      aria-selected={isSelected}
      tabindex={wrapper.focusedKey === node.key ? 0 : -1}
    >
      {#if proxy.icon}
        <span class={proxy.icon} aria-hidden="true"></span>
      {/if}
      <span data-tag-label>{proxy.label}</span>
      {#if onremove}
        <button
          data-tag-remove
          aria-label="Remove {proxy.label}"
          onclick={(e) => { e.stopPropagation(); onremove(proxy.value, proxy.original) }}
        ></button>
      {/if}
    </span>
  {/each}
</div>
```

---

## 12. Zero-Errors Policy

Before touching any code:
```bash
bun run test:ci && bun run lint   # record baseline — fix any errors FIRST
```

After all changes:
```bash
bun run test:ci && bun run lint   # must be zero errors to be done
cd packages/themes && bun run build  # if CSS changed
```

Forbidden: "no new errors", "pre-existing", "files I didn't touch". The count must be zero.
