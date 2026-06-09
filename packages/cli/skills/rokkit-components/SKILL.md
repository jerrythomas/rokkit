---
name: rokkit-components
description: Use when building UI with Rokkit components in a Svelte 5 app — the data-first contract (items, bindable value, fields field-mapping, onchange/onselect), snippet-based customization, built-in keyboard navigation + ARIA, and which component to reach for (List, Tree, Select, MultiSelect, Menu, Table, Tabs, Toggle).
---

# Rokkit Components — Usage

Rokkit components are data-first: you pass an array, bind a value, and the component
handles rendering, keyboard navigation, and accessibility out of the box. You extend
behavior through the `fields` prop (remap data keys) and named snippets (customize
rendering) — not by modifying components or writing boilerplate.

Import from `@rokkit/ui`:

```svelte
import { List, Tree, Select, MultiSelect, Menu, Table, Tabs, Toggle } from '@rokkit/ui'
```

---

## The data-first contract

Every Rokkit component follows a consistent API:

| Prop | Purpose |
|------|---------|
| `items` / `options` / `data` | The data array to render |
| `bind:value` | Bindable selected value (or values array for MultiSelect) |
| `fields` | Remap your data's key names to component semantic keys |
| `onchange` / `onselect` | Callback fired when selection changes |

Primitive arrays (strings, numbers) work without any transformation:

```svelte
<script>
  import { List } from '@rokkit/ui'

  const nav = ['Dashboard', 'Reports', 'Settings']
  let value = $state(null)
</script>

<List items={nav} bind:value onselect={(v) => console.log('selected:', v)} />
```

Object arrays are equally direct — use `fields` only when your key names differ from defaults:

```svelte
<script>
  import { Select } from '@rokkit/ui'

  const countries = [
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' }
  ]
  let value = $state(null)
</script>

<!-- fields remaps 'name' → label slot, 'code' → value slot -->
<Select items={countries} fields={{ label: 'name', value: 'code' }} bind:value />
```

**Prop naming note:** `List`, `Tree`, `Select`, `MultiSelect`, and `Menu` all take `items`.
`Tabs` and `Toggle` take `options`. `Table` takes `data`.

---

## Field mapping (fields)

The `fields` prop is a plain object that maps **semantic slot names** → **your data's key names**.
It never mutates your data — it is only a read instruction for the component.

### Default field keys

These are the raw key names each component reads by default. Override only the ones that differ in your data.

| Semantic slot | Default key | Used by |
|---------------|-------------|---------|
| `label` / `text` | `'label'` / `'text'` | display text (see note) |
| `value` | `'value'` | selection value |
| `icon` | `'icon'` | icon CSS class |
| `children` | `'children'` | nested items array |
| `href` | `'href'` | URL (renders as `<a>`) |
| `disabled` | `'disabled'` | disabled state |
| `expanded` | `'expanded'` | initial expand state |
| `type` | `'type'` | `'separator'` / `'spacer'` markers |
| `snippet` | `'snippet'` | per-item named snippet override |
| `badge` | `'badge'` | badge / count indicator |
| `description` | `'description'` | secondary subtitle text |

> **Text field note:** `List` / `Tree` / `Menu` read `item.label` by default.
> `Select` / `MultiSelect` also read `item.label` (they use `fields.label || 'label'`
> internally). Tabs reads `item.text` or `item.label`. `Toggle` reads `item.text`
> (with `label` as fallback). When in doubt, provide both keys or use `fields`.

### Remapping example

Your API returns `{ id, title, subitems }`. Map to Rokkit slots with `fields`:

```svelte
<List
  items={apiData}
  fields={{ value: 'id', label: 'title', children: 'subitems' }}
  bind:value
/>
```

### Table columns

`Table` uses a separate `columns` array to define column shapes. Row-level identity
is set via `fields={{ value: 'id' }}` (defaults to `'id'`):

```svelte
<script>
  import { Table } from '@rokkit/ui'

  const columns = [
    { name: 'name',   label: 'Full Name', sortable: true },
    { name: 'role',   label: 'Role',      sortable: true },
    { name: 'active', label: 'Active',    sortable: false, align: 'center' }
  ]
  const rows = [
    { id: 1, name: 'Alice', role: 'Admin', active: true },
    { id: 2, name: 'Bob',   role: 'Editor', active: false }
  ]
  let value = $state(null)
</script>

<Table data={rows} {columns} bind:value />
```

---

## Snippet customization

Snippets let you replace inner rendering without changing the component's
wrapper, ARIA structure, or keyboard handling. The component always owns the
interactive container (`<button>`, `<a>`, tab panel, etc.) — snippets control
the **inner content** only.

### itemContent — List, Tree, Menu (and Toggle, for option labels)

The most common override. Receives a `ProxyItem` instance:

```svelte
<List {items} bind:value onselect={(v) => (value = v)}>
  {#snippet itemContent(proxy)}
    {#if proxy.icon}
      <span class={proxy.icon} aria-hidden="true"></span>
    {/if}
    <span class="flex-1">{proxy.label}</span>
    {#if proxy.get('badge')}
      <span class="ml-auto text-xs text-ink-mute">{proxy.get('badge')}</span>
    {/if}
  {/snippet}
</List>
```

### groupContent — List, Menu (not Tree — tree nodes use itemContent)

Overrides the group header button content (the expand/collapse header row):

```svelte
<List {items} collapsible bind:value>
  {#snippet groupContent(proxy)}
    <span class={proxy.icon}></span>
    <span>{proxy.label}</span>
    <span class={proxy.expanded ? 'i-lucide:chevron-down' : 'i-lucide:chevron-right'}></span>
  {/snippet}
</List>
```

### ProxyItem API (passed to all content snippets)

| Property / method | Description |
|-------------------|-------------|
| `proxy.label` | Mapped display text |
| `proxy.icon` | Mapped icon CSS class |
| `proxy.value` | The original raw item (object or primitive) |
| `proxy.href` | Mapped href |
| `proxy.disabled` | Whether this item is disabled |
| `proxy.expanded` | Expand state for groups/nodes (reactive `$state`) |
| `proxy.hasChildren` | True when the item has a `children` array |
| `proxy.get('key')` | Read any field by semantic or raw name |

### Select and MultiSelect snippets

Select and MultiSelect do not expose a trigger or chips snippet — the trigger face
and selected chips are rendered from `fields`/`label` and are not consumer-overridable.

Both components support `itemContent` and `groupContent` for the **dropdown options**,
using the same `ProxyItem` API as `List`:

```svelte
<Select {items} bind:value>
  {#snippet itemContent(proxy)}
    {#if proxy.icon}
      <span class={proxy.icon} aria-hidden="true"></span>
    {/if}
    <span>{proxy.label}</span>
    {#if proxy.get('description')}
      <span class="text-xs text-ink-mute ml-auto">{proxy.get('description')}</span>
    {/if}
  {/snippet}
</Select>
```

The same `itemContent` / `groupContent` patterns work identically on `MultiSelect`.

### Tabs snippets

`Tabs` supports `tabPanel` (receives one `ProxyItem` argument) and `itemContent`
(for the tab trigger button content). Access panel data via `proxy.get('key')`:

```svelte
<Tabs {options} bind:value>
  {#snippet tabPanel(proxy)}
    <div class="p-4">
      <h2 class="text-ink font-medium">{proxy.label}</h2>
      <div>{proxy.get('content')}</div>
    </div>
  {/snippet}
</Tabs>
```

`Tabs` also supports an `empty` snippet (no arguments) rendered when `options` is empty.

### Per-item named snippets (List)

Set `item.snippet = 'name'` on specific items to route them to a named snippet.
Other items fall back to `itemContent`:

```svelte
<script>
  const items = [
    { label: 'Apple',  snippet: 'fruit' },
    { label: 'Carrot', snippet: 'veggie' }
  ]
</script>

<List {items}>
  {#snippet fruit(proxy)}
    <span class="i-lucide:apple"></span>
    <span>{proxy.label}</span>
  {/snippet}
  {#snippet veggie(proxy)}
    <span class="i-lucide:carrot"></span>
    <span>{proxy.label}</span>
  {/snippet}
</List>
```

---

## Keyboard navigation & accessibility

Rokkit components are accessible out of the box — no extra wiring required as a consumer.
The navigator pattern handles keyboard events on the component's root or dropdown container.

### What you get for free

| Component | Keys | ARIA |
|-----------|------|------|
| List / Tree | `↑↓` move focus, `↵`/`Space` select, `→`/`←` expand/collapse groups, `Home`/`End`, typeahead `a-z` | `role="navigation"`, `aria-current="page"` on active link |
| Select / MultiSelect | `↑↓` navigate dropdown, `↵` select/toggle, `Esc` close, `Home`/`End` | `role="combobox"`, `aria-expanded`, `aria-selected` |
| Menu | `↑↓` navigate items, `↵`/`Space` select, `Esc` close + return focus | `role="menu"`, `role="menuitem"` |
| Tree | `↑↓` navigate, `→` expand/enter first child, `←` collapse/go to parent | `role="tree"`, `role="treeitem"`, `aria-expanded`, `aria-selected` |
| Table | `↑↓` between rows, `↵`/`Space` select | `role="grid"`, `aria-sort` on sortable columns, `aria-selected` on rows |
| Tabs | `←`/`→` (horizontal) or `↑`/`↓` (vertical) between tabs, `↵`/`Space` select | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Toggle | `←`/`→` between options, `↵`/`Space` select | `role="radiogroup"`, `role="radio"`, `aria-checked` |

### Focus management note

The components sync `bind:value` to DOM focus automatically — when `value` changes
programmatically, the component moves keyboard focus to the matching item. You do not
need to call `focus()` yourself.

### Interactive elements inside snippets

If your `itemContent` snippet contains its own interactive elements (inputs, buttons),
stop propagation to prevent the navigator from also triggering selection:

```svelte
<List {items}>
  {#snippet itemContent(proxy)}
    <span class="flex-1">{proxy.label}</span>
    <button
      onclick={(e) => { e.stopPropagation(); doAction(proxy.value) }}
    >
      Action
    </button>
  {/snippet}
</List>
```

Do NOT add an `onclick` on elements that also carry `data-path` — the navigator
intercepts those clicks and would double-fire.

---

## Which component when

| Need | Component | Data prop | Callback |
|------|-----------|-----------|----------|
| Vertical navigable list (sidebar nav, option list) | `List` | `items` | `onselect` |
| Hierarchical tree with expand/collapse | `Tree` | `items` | `onselect` |
| Dropdown single selection | `Select` | `items` | `onchange` |
| Dropdown multi-selection with chips | `MultiSelect` | `items` | `onchange` |
| Contextual action menu (dropdown actions) | `Menu` | `items` | `onselect` |
| Flat data table with columns + row selection | `Table` | `data` | `onselect` |
| Tabbed panels (horizontal or vertical) | `Tabs` | `options` | `onchange` |
| Compact mode/view switcher (segmented control) | `Toggle` | `options` | `onchange` |

**Use `List` not `Select`** when the options are always visible (sidebar, settings panel).
**Use `Select` not `List`** when screen space is limited and the dropdown can close.
**Use `Toggle` not `Tabs`** for 2–5 options with no panel content (just a mode switch).
**Use `Tree` not `List`** when data is genuinely hierarchical (file system, nested categories).

---

## Recipes

### Select bound to a value

```svelte
<script>
  import { Select } from '@rokkit/ui'

  const roles = [
    { label: 'Admin',  value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' }
  ]
  let role = $state('viewer')
</script>

<Select items={roles} bind:value={role} onchange={(v) => console.log('role:', v)} />
<p>Current role: {role}</p>
```

### Tree with nested children

```svelte
<script>
  import { Tree } from '@rokkit/ui'

  const files = [
    {
      label: 'src',
      icon: 'i-lucide:folder',
      children: [
        { label: 'index.ts',  icon: 'i-lucide:file-code' },
        { label: 'utils.ts',  icon: 'i-lucide:file-code' }
      ]
    },
    { label: 'README.md', icon: 'i-lucide:file-text' }
  ]

  let selected = $state(null)
</script>

<Tree items={files} bind:value={selected} onselect={(v) => console.log('file:', v)} />
```

### MultiSelect with chips

```svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  const tags = [
    { label: 'Frontend', value: 'fe' },
    { label: 'Backend',  value: 'be' },
    { label: 'DevOps',   value: 'ops' }
  ]
  let selected = $state([])
</script>

<MultiSelect
  items={tags}
  bind:value={selected}
  placeholder="Select tags…"
  onchange={(vals) => console.log('selected:', vals)}
/>
<p>Tags: {selected.join(', ')}</p>
```

### Table with explicit columns and field mapping

```svelte
<script>
  import { Table } from '@rokkit/ui'

  // Row identifier is 'uid' — remap via fields
  const users = [
    { uid: 1, fullName: 'Alice Chen',  dept: 'Engineering' },
    { uid: 2, fullName: 'Bob Tanaka',  dept: 'Design' }
  ]

  const columns = [
    { name: 'fullName', label: 'Name',       sortable: true },
    { name: 'dept',     label: 'Department', sortable: true }
  ]

  let selectedUser = $state(null)
</script>

<Table
  data={users}
  {columns}
  fields={{ value: 'uid' }}
  bind:value={selectedUser}
  caption="User list"
  onselect={(v, row) => console.log('selected row:', row)}
/>
```
