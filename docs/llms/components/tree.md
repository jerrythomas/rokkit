# Tree

> Hierarchical tree view with connectors, keyboard navigation, lazy loading, multi-selection, and type-ahead search.

**Export**: `Tree` from `@rokkit/ui`
**Navigation**: `NestedController` + `navigator` (Pattern B)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeItem[]` | `[]` | Root items |
| `fields` | `Partial<TreeFields>` | — | Field mapping |
| `value` | `unknown` | — | Selected value (bindable) |
| `showLines` | `boolean` | `false` | Show tree connector lines |
| `expanded` | `Record<string, boolean>` | `{}` | Expanded nodes by item key (bindable) |
| `expandAll` | `boolean` | `false` | Expand all nodes on mount |
| `multiselect` | `boolean` | `false` | Enables multi-selection |
| `selected` | `unknown[]` | `[]` | Selected values (bindable) |
| `active` | `unknown` | — | Highlight without selecting |
| `icons` | `Partial<TreeStateIcons>` | — | Override icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |
| `onselect` | `(value, item) => void` | — | Called on selection |
| `ontoggle` | `(key, expanded) => void` | — | Called on node expand/collapse |
| `onselectedchange` | `(values, items) => void` | — | Multi-selection callback |
| `onexpandedchange` | `(expanded) => void` | — | Expanded state callback |
| `onloadchildren` | `(item) => Promise<TreeItem[]>` | — | Async child loader (lazy load) |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `item` | `(item, fields, handlers)` | Custom node renderer |
| `[key]` | `(item, fields, handlers)` | Named snippet per `item.snippet` key |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Node label |
| `value` | `'value'` | Selection value |
| `icon` | `'icon'` | Icon CSS class |
| `description` | `'description'` | Secondary text |
| `disabled` | `'disabled'` | Disabled flag |
| `children` | `'children'` | Child items |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowUp / ArrowDown` | Move focus |
| `ArrowRight` | Expand node (if collapsed); enter first child (if expanded) |
| `ArrowLeft` | Collapse node (if expanded); move to parent (if leaf/collapsed) |
| `Home / End` | First / last visible node |
| `Enter` | Select focused node |
| `Escape` | Clear selection |
| `Shift+Space` | Extend selection range |
| `Printable char` | Type-ahead jump |

## Examples

### Basic tree

```svelte
<script>
  import { Tree } from '@rokkit/ui'
  const items = [
    {
      text: 'src',
      children: [
        { text: 'components', children: [{ text: 'Button.svelte', value: '/src/components/Button.svelte' }] },
        { text: 'index.ts', value: '/src/index.ts' }
      ]
    }
  ]
  let value = $state()
</script>

<Tree {items} showLines bind:value />
```

### Custom field mapping

```svelte
<Tree
  items={fileTree}
  fields={{ text: 'name', value: 'path', children: 'entries' }}
  bind:value={selectedPath}
/>
```

### Start all expanded

```svelte
<Tree {items} expandAll />
```

### Lazy loading children

```svelte
<Tree
  {items}
  onloadchildren={async (item) => {
    const res = await fetch(`/api/children?id=${item.id}`)
    return res.json()
  }}
/>
```
Items with `children: null` (not `[]`) trigger `onloadchildren` on expand.

### Multi-selection

```svelte
<Tree {items} multiselect bind:selected={selectedPaths} />
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-tree` | Root | Always |
| `data-tree-node` | Node | Always |
| `data-focused` | Node | Keyboard focused |
| `data-selected` | Node | Selected |
| `data-disabled` | Node | Disabled |
| `data-expanded` | Node | Has children and is expanded |
| `data-leaf` | Node | No children |
| `data-loading` | Node | Async children loading |
| `data-multiselect` | Root | Multi-select mode |

## Notes

- **`expanded` prop**: Keyed by the item's value field (nodeKey), not the controller path key.
- **Lazy loading**: Set `children: null` (not `[]`) on items to trigger `onloadchildren`. Once loaded, children are cached in the item.
- **Tree-style expand/collapse**: Expanding an already-expanded node moves focus to first child; collapsing a leaf moves focus to its parent.
- **Connector lines**: `showLines` renders SVG line connectors. Requires `[data-tree]` theme CSS.
