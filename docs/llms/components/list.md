# List

> Flat or grouped list with keyboard navigation, multi-selection, type-ahead search, and collapsible groups.

**Export**: `List` from `@rokkit/ui`
**Navigation**: `NestedController` + `navigator` (Pattern B)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ListItem[]` | `[]` | Data items |
| `fields` | `Partial<ListFields>` | — | Field mapping |
| `value` | `unknown` | — | Selected value (bindable) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Item size |
| `disabled` | `boolean` | `false` | Disables all interaction |
| `collapsible` | `boolean` | `false` | Enables group expand/collapse |
| `expanded` | `Record<string, boolean>` | `{}` | Expanded group state (bindable) |
| `multiselect` | `boolean` | `false` | Enables multi-selection |
| `selected` | `unknown[]` | `[]` | Selected values for multi-select (bindable) |
| `active` | `unknown` | — | Highlight an item without selecting (e.g., current route) |
| `icons` | `Partial<ListStateIcons>` | — | Override icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |
| `onselect` | `(value, item) => void` | — | Called on single selection |
| `onselectedchange` | `(values, items) => void` | — | Called on multi-selection change |
| `onexpandedchange` | `(expanded) => void` | — | Called when expanded state changes |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `item` | `(item, fields, handlers)` | Custom item renderer |
| `groupLabel` | `(item, fields)` | Custom group header renderer |
| `[key]` | `(item, fields, handlers)` | Named snippet per `item.snippet` key |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Display label |
| `value` | `'value'` | Selection value |
| `icon` | `'icon'` | Icon CSS class |
| `description` | `'description'` | Secondary text |
| `disabled` | `'disabled'` | Disabled flag |
| `children` | `'children'` | Child items (groups) |

See [field-mapping.md](field-mapping.md) for the full `ItemFields` interface, grouped data structures, fallback resolution, nested field mapping, and lazy loading.

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowUp / ArrowDown` | Move focus |
| `ArrowRight` | Expand group |
| `ArrowLeft` | Collapse group (or move to parent) |
| `Home / End` | First / last item |
| `Enter` | Select focused item |
| `Escape` | Clear selection |
| `Space` | Select (multi: toggle) |
| `Shift+Space` | Extend selection range |
| `Printable char` | Type-ahead jump to matching item |

## Examples

### Flat list

```svelte
<script>
  import { List } from '@rokkit/ui'
  const items = [
    { text: 'Apple', value: 'apple' },
    { text: 'Banana', value: 'banana' },
  ]
  let value = $state()
</script>

<List {items} bind:value onselect={(v, item) => console.log(v, item)} />
```

### Grouped / collapsible

```svelte
<List items={groupedData} collapsible bind:expanded />
```

Where `groupedData` has items with a `children` array:
```js
[
  { text: 'Fruits', children: [{ text: 'Apple', value: 'apple' }] },
  { text: 'Veggies', children: [{ text: 'Carrot', value: 'carrot' }] }
]
```

### Custom field mapping

```svelte
<List
  items={users}
  fields={{ text: 'fullName', value: 'userId', icon: 'avatar', children: 'reports' }}
  bind:value={selectedUserId}
/>
```

### Multi-selection

```svelte
<List items={data} multiselect bind:selected={selectedItems} />
```
`Ctrl+click` or `Shift+click` for range. `selected` is an array of extracted values.

### Custom item snippet

```svelte
{#snippet customItem(item, fields, handlers)}
  <div class="flex items-center gap-2" data-path={handlers.path}>
    <span class={item.icon}></span>
    <span>{item.text}</span>
    <small>{item.description}</small>
  </div>
{/snippet}

<List {items} item={customItem} />
```

### Mark active without selection (e.g. sidebar nav)

```svelte
<List {items} active={$page.url.pathname} fields={{ value: 'href' }} />
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-list` | Root | Always |
| `data-list-item` | Item | Always |
| `data-focused` | Item | Keyboard focused |
| `data-selected` | Item | Selected (single or multi) |
| `data-disabled` | Item | Disabled |
| `data-group` | Group header | Always |
| `data-group-expanded` | Group header | Group is open |
| `data-multiselect` | Root | Multi-select mode |
| `aria-multiselectable` | Root | Multi-select mode |

## Notes

- **Type-ahead**: Enabled by default. Single printable char jumps to matching item (prefix match, case-insensitive, 500ms reset buffer).
- **Expand on init**: Groups default to expanded. Pass `expanded={{ groupKey: false }}` to start collapsed.
- **Group keys**: Groups are keyed by their `text` field value.
- **`active` vs `value`**: `active` highlights without triggering selection — useful for routing where the current page indicator should not drive controlled state.
