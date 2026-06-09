## Hierarchical, data-driven navigation

Tree renders nested data with expand/collapse, keyboard navigation,
field mapping, and customisable item rendering via snippets. The
right component for multi-level structures — file systems, org
charts, navigation outlines, parent/child catalogs.

## Basic example

Pass a nested array of objects with `label`, `value`, and optionally
`icon` and `children`. Nodes that have a `children` array are
rendered as expandable branches.

```svelte
<Tree {items} bind:value />
```

## Indent lines

Set `lineStyle="none"` for plain indentation, or pick between
`"solid"` (default), `"dashed"`, and `"dotted"` for visible connector
lines. The default is a continuous solid line — change it from the
**Live** view's Tweaks slab or type `change lineStyle to dotted` in
the composer to see each style in place.

## Field mapping

Most real data doesn't use the component's default field names. Use
the `fields` prop to remap without transforming your data:

```svelte
<Tree
  items={users}
  fields={{ label: 'name', value: 'id', children: 'reports' }}
/>
```

## Custom expand/collapse icons

Override the default chevrons via the `icons` prop. The example
below uses folder icons for a file-manager style tree:

```svelte
<Tree
  {items}
  icons={{ expanded: 'i-mdi:folder-open', collapsed: 'i-mdi:folder' }}
/>
```

## Custom item rendering

Use the `itemContent` snippet to fully control what appears inside
each node. The snippet receives a `ProxyItem` — use `proxy.label`,
`proxy.icon`, and `proxy.get('fieldName')` to access any field. Set
`item.snippet = 'name'` on an item to route it to a per-item snippet
named `name` instead.

## ProxyItem API

Snippets receive a `ProxyItem` with mapped access to common fields:

- **`proxy.label`** — mapped display text
- **`proxy.icon`** — mapped icon class
- **`proxy.href`** — mapped href (renders as an `<a>`)
- **`proxy.value`** — the original raw item
- **`proxy.disabled`** — disabled state
- **`proxy.expanded`** — expand state for branch nodes
- **`proxy.hasChildren`** — whether the node has children
- **`proxy.get('field')`** — read any field by name
