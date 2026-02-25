# Select

> Single-select dropdown with keyboard navigation, optional search filter, and grouped options.

**Export**: `Select` from `@rokkit/ui`
**Navigation**: `ListController` + `navigator` (Pattern A)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectItem[]` | `[]` | Option items |
| `fields` | `Partial<SelectFields>` | — | Field mapping |
| `value` | `unknown` | — | Selected value (bindable) |
| `selected` | `SelectItem \| null` | `null` | Full selected item (bindable) |
| `placeholder` | `string` | `'Select...'` | Placeholder when nothing selected |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dropdown size |
| `align` | `'left' \| 'right' \| 'start' \| 'end'` | `'left'` | Dropdown horizontal alignment |
| `direction` | `'down' \| 'up'` | `'down'` | Dropdown vertical direction |
| `maxRows` | `number` | `5` | Max visible rows before scrolling |
| `disabled` | `boolean` | `false` | Disables interaction |
| `filterable` | `boolean` | `false` | Show search input in dropdown |
| `filterPlaceholder` | `string` | `'Search...'` | Filter input placeholder |
| `icons` | `Partial<SelectStateIcons>` | — | Override icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value, item) => void` | — | Called on selection |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `item` | `(item, fields, handlers)` | Custom option renderer |
| `groupLabel` | `(item, fields)` | Custom group header |
| `selectedValue` | `(item, fields)` | Custom selected value display in trigger |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Option label |
| `value` | `'value'` | Selection primitive |
| `icon` | `'icon'` | Option icon |
| `description` | `'description'` | Secondary text |
| `disabled` | `'disabled'` | Disabled flag |
| `children` | `'children'` | Group children |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter / Space` | Open dropdown / select focused |
| `ArrowUp / ArrowDown` | Move focus in dropdown |
| `Home / End` | First / last option |
| `Escape` | Close dropdown (clear filter first if filterable) |
| `Printable char` | Type-ahead (when filter not active) |

## Examples

### Basic

```svelte
<script>
  import { Select } from '@rokkit/ui'
  const options = ['Apple', 'Banana', 'Cherry']
  let value = $state()
</script>

<Select {options} bind:value />
```

### Object options with custom fields

```svelte
<Select
  options={users}
  fields={{ text: 'fullName', value: 'id', description: 'email' }}
  bind:value={selectedUserId}
  onchange={(id, user) => console.log(id, user)}
/>
```

### Grouped options

```svelte
<Select
  options={[
    { text: 'Fruits', children: [{ text: 'Apple', value: 'apple' }] },
    { text: 'Veggies', children: [{ text: 'Carrot', value: 'carrot' }] }
  ]}
  bind:value
/>
```

### With search filter

```svelte
<Select options={largeList} filterable filterPlaceholder="Search countries..." bind:value />
```

Filter is case-insensitive substring. Groups with no matching children are hidden. Empty state shows "No results". Escape clears filter first, then closes.

### Dropdown direction / alignment

```svelte
<Select options={items} direction="up" align="right" bind:value />
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-select` | Root | Always |
| `data-select-open` | Root | Dropdown open |
| `data-select-item` | Option | Always |
| `data-focused` | Option | Keyboard focused |
| `data-selected` | Option | Currently selected |
| `data-disabled` | Option | Disabled |

## Notes

- `value` binds the extracted primitive (`item[fields.value]`). For primitive arrays like `['apple', 'banana']`, the item itself is the value.
- `selected` bindable gives access to the full item object when needed alongside `value`.
- Filter state is cleared on close and after selection.
- `selectedItem` for the trigger always searches all options (not filtered list) so trigger display remains correct.
