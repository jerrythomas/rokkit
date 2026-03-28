# Design Patterns

Established patterns cookbook. Add patterns here once they are proven (used in 2+ places).
Reference this file before implementing new features to ensure consistency.

---

## How to Use This File

1. **Before implementing**: Check if an existing pattern applies
2. **After implementing**: If you created a new reusable pattern, document it here
3. **Format**: Each pattern includes context (when to use), the pattern itself, and an example

---

## Patterns

### Data-Attribute DOM Conventions

**Context:** All Rokkit components expose their DOM structure for CSS theming and testing via `data-*` attributes. Custom element tags (`<rk-*>`) are **not used** — they were an early design that was abandoned.

**Rules:**

1. **Root marker** — Every component root has a single marker attribute that identifies it:

```html
<div data-list>...</div>
<div data-select>...</div>
<div data-rating>...</div>
```

2. **Sub-element markers** — Child elements use `data-{component}-{role}`:

```html
<div data-list-item data-path="0">
  <span data-select-trigger> <div data-range-thumb></div></span>
</div>
```

3. **Boolean state attributes** — Presence means true, absence means false (no `="true"`/`="false"`):

```html
<div data-list-item data-active>
  <!-- active -->
  <div data-list-item>
    <!-- not active -->
    <div data-range-thumb data-sliding><!-- currently dragging --></div>
  </div>
</div>
```

4. **Value state attributes** — Enumerated states use `data-{attr}="{value}"`:

```html
<div data-select data-size="md">
  <div data-list data-density="compact"></div>
</div>
```

5. **CSS selectors** — Theme CSS always selects by attribute, never by element tag or class:

```css
/* Correct */
[data-list-item][data-active] { ... }
[data-range-thumb][data-sliding] { ... }

/* Never do this */
rk-item { ... }
.list-item.active { ... }
```

6. **Naming convention** for data attributes: `data-{component}` (root), `data-{component}-{part}` (child), consistent `data-{state}` names across components (`data-disabled`, `data-active`, `data-selected`, `data-open`).

**Enforcement:** No `<rk-*>` custom element tags anywhere in library components, test fixtures, or documentation examples. Use `<span>`, `<div>`, or semantic HTML with `data-*` attributes instead.

**Used in:** Every component in `@rokkit/ui` and `@rokkit/forms`.

---

### Navigator / Wrapper / ProxyItem Stack

**Context:** Any persistent list-like component (List, Tree) that needs keyboard navigation, item selection, and custom snippet rendering. Also used in dropdown components (Select, MultiSelect, Menu) that pop a navigable list.

**Architecture — Four Layers:**

| Layer       | Class / File                          | Responsibility                                                                                                                                   |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ProxyItem` | `@rokkit/states/proxy-item.svelte.js` | Read-only view of a raw item through a field map. Provides `.label`, `.icon`, `.href`, `.value`, `.expanded`, `.disabled`, `.get('field')`.      |
| `ProxyTree` | `@rokkit/states/proxy-tree.svelte.js` | Wraps an items array with field mapping. Owns `flatView` (flat array of `{ key, proxy, level, hasChildren, type }`) and `lookup` Map.            |
| `Wrapper`   | `@rokkit/states/wrapper.svelte.js`    | Navigation controller. Owns `focusedKey`, re-exposes `flatView`. Actions: `first`, `last`, `next`, `prev`, `select`, `expand`, `collapse`, etc. |
| `Navigator` | `@rokkit/actions/navigator.js`        | Plain class. Attaches DOM `keydown`/`click` listeners on a container. Translates key events → calls `wrapper[action](key)`.                     |

**Key point:** `proxy.label` is the display text — default field is `label`, NOT `text`.

**Pattern — Using the stack in a component:**

```svelte
<script>
  // @ts-nocheck
  import { Wrapper, ProxyTree } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'
  import { resolveSnippet, ITEM_SNIPPET, GROUP_SNIPPET } from '@rokkit/core'

  let {
    items = [],
    value = $bindable(),
    fields = {},
    onselect,
    class: className = '',
    ...snippets
  } = $props()

  // handleSelect MUST be defined outside $derived — binding propagation requires it
  function handleSelect(v, proxy) {
    value = v
    onselect?.(v, proxy.original)
  }

  const tree = $derived(new ProxyTree(items, fields))
  const wrapper = $derived(new Wrapper(tree, { onselect: handleSelect }))

  let listRef = $state(null)

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

<div bind:this={listRef} data-list class={className || undefined}>
  {#each wrapper.flatView as node (node.key)}
    {#if node.type === 'separator'}
      <hr data-list-separator />
    {:else if node.hasChildren}
      <div data-list-group data-path={node.key} role="group">
        {@const content = resolveSnippet(snippets, node.proxy, GROUP_SNIPPET)}
        {#if content}{@render content(node.proxy)}{:else}<span>{node.proxy.label}</span>{/if}
      </div>
    {:else}
      {@const isSelected = node.proxy.value === value}
      {@const content = resolveSnippet(snippets, node.proxy, ITEM_SNIPPET)}
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
        {#if content}{@render content(node.proxy)}{:else}<span>{node.proxy.label}</span>{/if}
      </button>
    {/if}
  {/each}
</div>
```

**Flat DOM structure:** Groups do NOT wrap their children. The entire `wrapper.flatView` is a single flat loop. Expansion state is tracked by `Wrapper`; `flatView` only includes currently-visible nodes.

**`expandedByKey` reactivity workaround:** Svelte 5 cannot track reactivity through a `$derived` Map → `proxy.expanded` (`$state`) in templates. Maintain a separate `$state<Record<string, boolean>>` synced after mutations. See `List.svelte` for the implementation.

**Navigator click interception:** Navigator intercepts ALL clicks on `[data-path]` elements and calls `wrapper.select()`. **Never add `onclick` on elements that also have `data-path`** — it fires twice. Handle post-select logic via the `onselect` callback passed to `Wrapper`.

**Used in:** List, Tree, Select, MultiSelect, Menu, Dropdown, Toggle, Tabs.

---

### Snippet Customization

**Context:** Any component that renders items and needs to let consumers customize rendering without forking the component.

**API — three snippet slots:**

| Snippet               | When used                          | Receives                              |
| --------------------- | ---------------------------------- | ------------------------------------- |
| `itemContent(proxy)`  | Every leaf item                    | `ProxyItem`                           |
| `groupContent(proxy)` | Every group header                 | `ProxyItem`                           |
| `[name](proxy)`       | Items with `item.snippet = 'name'` | `ProxyItem` (per-item named override) |

**`resolveSnippet(snippets, proxy, fallbackName)`** — from `@rokkit/core/src/utils.js`:

1. Check `proxy.get('snippet')` → look for `snippets[snippetName]`
2. Fall back to `snippets[fallbackName]` (`'itemContent'` or `'groupContent'`)
3. Return `undefined` if neither found (component renders default content)

**Pattern — component template:**

```svelte
{#snippet defaultContent(proxy)}
  {#if proxy.icon}<span class={proxy.icon} aria-hidden="true"></span>{/if}
  <span>{proxy.label}</span>
{/snippet}

<!-- In each loop (snippets spread from $props()) -->
{@const snippet = resolveSnippet(snippets, proxy, 'itemContent') ?? defaultContent}
{@render snippet(proxy)}
```

**Pattern — consumer usage:**

```svelte
<!-- Override all items -->
<List {items}>
  {#snippet itemContent(proxy)}
    <span class={proxy.icon}></span>
    <span class="flex-1">{proxy.label}</span>
    <span class="badge">{proxy.get('status')}</span>
  {/snippet}
</List>

<!-- Per-item override via item.snippet -->
<List
  items={[
    { label: 'Apple', snippet: 'fruit' },
    { label: 'Carrot', snippet: 'vegetable' }
  ]}
>
  {#snippet fruit(proxy)}<span class="text-error-z5">{proxy.label}</span>{/snippet}
  {#snippet vegetable(proxy)}<span class="text-success-z5">{proxy.label}</span>{/snippet}
</List>
```

**`proxy.value` mutation pattern (interactive elements in snippets):**

```svelte
{#snippet itemContent(proxy)}
  <span class="flex-1">{proxy.label}</span>
  <input
    type="checkbox"
    checked={proxy.get('checked')}
    onchange={(e) => {
      proxy.value.checked = e.currentTarget.checked
    }}
    onclick={(e) => e.stopPropagation()}
  />
  <!-- prevent List selection -->
{/snippet}
```

**Used in:** List, Tree, Select, MultiSelect, Menu.

---

### `class` Prop Convention

**Context:** Any component that renders a root element and should allow consumers to add UnoCSS/CSS classes to constrain layout (height, width, overflow, etc.).

**Pattern:**

```svelte
let { class: className = '', ...rest } = $props()
```

```html
<nav data-list class={className || undefined}></nav>
```

**Common use cases:**

```svelte
<List {items} class="max-h-64 overflow-y-auto" />
<!-- fixed height with scroll -->
<List {items} class="w-48" />
<!-- fixed width -->
```

**Rule:** The `class` prop is additive — it appends to the component's own structural classes. Never replace them. If the component has no own classes (uses data-attribute CSS), the `class` prop is the only class on the root element.

**Applied to:** List, Tree, Select, MultiSelect, Menu, Toggle, Tabs, Toolbar.

---

### State Icons

**Context:** When a component needs icons for UI states (expand/collapse, checked/unchecked, copy actions, etc.).

**Architecture — Two-Layer Customization:**

1. **Global** — Semantic icon names are defined in `packages/core/src/constants.js` as `DEFAULT_ICONS` array (e.g., `node-opened`, `selector-closed`, `action-copy`). The `iconShortcuts(DEFAULT_ICONS, 'i-rokkit')` function in `uno.config.js` creates UnoCSS shortcuts that map these semantic names to actual icon classes (e.g., `node-opened` → `i-rokkit:node-opened`). Swapping the icon collection globally changes all icons.

2. **Per-instance** — Each component accepts an `icons` prop that merges with defaults, allowing overrides for a specific usage.

**Key Files:**

| File                             | Purpose                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| `packages/core/src/constants.js` | `DEFAULT_ICONS` array + `stateIconsFromNames()` → `DEFAULT_STATE_ICONS` |
| `packages/icons/src/base/`       | SVGs matching the naming convention (`node-opened.svg`, etc.)           |
| `site/uno.config.js`             | `iconShortcuts(DEFAULT_ICONS, 'i-rokkit')` global mapping               |
| `packages/core/src/utils.js`     | `iconShortcuts()` function                                              |

**Naming Convention:**

Flat icon names follow `{group}-{state}` pattern:

- `node-opened`, `node-closed` — Tree expand/collapse
- `selector-opened`, `selector-closed` — Select/Menu dropdown arrow
- `accordion-opened`, `accordion-closed` — List collapsible groups
- `action-copy`, `action-copysuccess` — Code copy button
- `action-remove` — MultiSelect tag remove
- `checkbox-checked`, `checkbox-unchecked` — Selection indicator
- `rating-filled`, `rating-empty`, `rating-half` — Rating stars

`stateIconsFromNames()` converts these to nested objects: `DEFAULT_STATE_ICONS.node.opened` → `'node-opened'`

**Pattern — Adding State Icons to a Component:**

1. **Define types** in `packages/ui/src/types/{component}.ts`:

```typescript
import { DEFAULT_STATE_ICONS } from '@rokkit/core'

export interface StateIcons {
  opened?: string
  closed?: string
}

export const defaultStateIcons: StateIcons = {
  opened: DEFAULT_STATE_ICONS.{group}.opened,
  closed: DEFAULT_STATE_ICONS.{group}.closed,
}
```

2. **Add to props interface**:

```typescript
export interface Props {
  icons?: StateIcons
  // ...other props
}
```

3. **Use in component** with merge-with-defaults pattern:

```svelte
<script lang="ts">
  import { defaultStateIcons } from '../types/{component}.js'

  let { icons: userIcons, ...rest } = $props()
  const icons = $derived({ ...defaultStateIcons, ...userIcons })
</script>

<span class={icons.opened} aria-hidden="true"></span>
```

4. **Add new icon names** — If a new state is needed:
   - Add flat name to `DEFAULT_ICONS` array in `packages/core/src/constants.js`
   - Add SVG to `packages/icons/src/base/{group}-{state}.svg`
   - The UnoCSS shortcut is auto-generated via `iconShortcuts()`

**Rule — no inline icon strings in components:** All icon defaults must come from `DEFAULT_STATE_ICONS.*`. Inline `i-lucide:*` / `i-solar:*` strings are only acceptable in playground/learn-site demos, never in library component source. See backlog #63 for the outstanding violations.

**Used in:** Tree, Select, MultiSelect, Menu, List, Code

---

### Component Labels (Translatable Strings)

**Context:** Any hardcoded English string used as an aria-label, button label, or state text inside a component (`aria-label="List"`, `"Copy code"`, `"Expand"`, etc.).

**Architecture — Two-Layer Override (mirrors State Icons):**

1. **App-global** — `messages` singleton in `@rokkit/states` holds all strings with English defaults, grouped by component. App sets translations once at startup via `messages.set({ ... })`.

2. **Per-instance** — each component accepts an optional `labels` prop (shallow-merged over the store values for that component).

**Key file:** `packages/states/src/messages.svelte.js` — `MessagesStore` class, single `messages` export.

**Naming convention — nested by component, semantic role:**

```
messages.list.label        → aria-label on <nav>
messages.tree.expand       → "Expand" for expand button
messages.carousel.prev     → "Previous slide" aria-label
messages.mode.system       → "System" label in ThemeSwitcher
```

**Pattern — using in a component:**

```svelte
<script lang="ts">
  import { messages } from '@rokkit/states'

  let { labels: userLabels, ...rest } = $props()
  const labels = $derived({ ...messages.list, ...userLabels })
</script>

<nav aria-label={labels.label}>
```

**Pattern — app-level translation:**

```js
// App startup (e.g., +layout.svelte)
import { messages } from '@rokkit/states'

// Named locale (preferred)
messages.register('fr', {
  tree: { expand: 'Ouvrir', collapse: 'Fermer', loading: 'Chargement…' },
  mode: { system: 'Système', light: 'Clair', dark: 'Sombre' }
})
messages.setLocale('fr')

// One-off override (backward compat)
messages.set({ tree: { expand: 'Ouvrir' } })
```

`messages.set()` and `messages.register()` deep-merge one level — partial overrides of a namespace don't wipe sibling keys.

---

### Value Binding Contract

**Context:** Any data-driven selection component (Toggle, Select, MultiSelect, List, Tree, Menu).

**Contract:**

| Prop                    | Type                                      | Description                                                                                                          |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `value` (bindable)      | `unknown` (single) or `unknown[]` (multi) | The **extracted value-field primitive** — what `item[fields.value]` resolves to. For string arrays, the item itself. |
| `onchange` / `onselect` | `(value, item) => void`                   | First arg: extracted primitive. Second arg: the full item object from the options array.                             |

**Rationale:** Consumers typically bind to an id or key (`bind:value={selectedId}`), not a full object. When the full object is needed, it's available via the callback's second argument. This matches native `<select>` semantics where `value` is the option's value attribute.

**How it works with field mapping:**

```svelte
<!-- fields.value defaults to 'value', so value binds to item.value -->
<Select items={users} fields={{ label: 'name', value: 'id' }} bind:value={selectedUserId} />

<!-- For string arrays, the item IS the value -->
<Toggle items={['day', 'week', 'month']} bind:value={period} />
```

**ItemProxy resolution order** for extracting value (`itemValue` getter):

1. Mapped value field: `item[fields.value]`
2. Fallback fields: `id`, `key`, `value`
3. Last resort: the original item itself (covers string/number arrays)

**ListController integration:**
`ListController.findByValue()` accepts both full item objects (deep equality) and extracted value-field primitives (fallback match via `item[fields.value]`). Components pass the extracted value directly:

```svelte
let controller = new ListController(items, value, userFields)
// value can be 'a' and controller finds { label: 'A', value: 'a' }
```

**Guard pattern for value sync:**
When using `ListController` + `navigator`, arrow keys move focus without changing selection. Use `lastSyncedValue` to prevent the value-sync `$effect` from fighting navigator focus moves:

```svelte
let lastSyncedValue = value

$effect(() => {
  if (value !== lastSyncedValue) {
    lastSyncedValue = value
    controller.moveToValue(value)
  }
})
```

**Current compliance:**

| Component   | `value` type              | `onchange`/`onselect` sig                              | Status    |
| ----------- | ------------------------- | ------------------------------------------------------ | --------- |
| Toggle      | extracted primitive       | `(value, item)`                                        | Compliant |
| Select      | extracted primitive       | `(value, item)` + `selected` bindable for full item    | Compliant |
| List        | extracted primitive       | `(value, item)`                                        | Compliant |
| Tree        | extracted primitive       | `(value, item)`                                        | Compliant |
| MultiSelect | extracted primitive array | `(values, items)` + `selected` bindable for full items | Compliant |

**Used in:** Toggle, Select, MultiSelect, List, Tree.
