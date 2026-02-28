# MultiSelect

> Multi-select dropdown with tag display, keyboard navigation, and value binding contract alignment.

**Export**: `MultiSelect` from `@rokkit/ui`
**Navigation**: `ListController` + `navigator` (Pattern A)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectItem[]` | `[]` | Option items |
| `fields` | `Partial<SelectFields>` | — | Field mapping |
| `value` | `unknown[]` | `[]` | Selected primitive values (bindable) |
| `selected` | `SelectItem[]` | `[]` | Full selected items (bindable) |
| `placeholder` | `string` | `'Select...'` | Placeholder when nothing selected |
| `maxDisplay` | `number` | `3` | Max tags shown before "+N more" |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disables interaction |
| `icons` | `Partial<SelectStateIcons>` | — | Override icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(values, items) => void` | — | Called on selection change |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `item` | `(item, fields, handlers)` | Custom option renderer |
| `tag` | `(item, fields, onremove)` | Custom tag renderer in trigger |

## Field Mapping

Same as `Select`: `text`, `value`, `icon`, `description`, `disabled`, `children`.

## Value Contract

```svelte
<MultiSelect
  options={users}
  fields={{ text: 'name', value: 'id' }}
  bind:value={selectedIds}       <!-- unknown[] of extracted primitives -->
  bind:selected={selectedUsers}  <!-- SelectItem[] of full objects -->
  onchange={(ids, users) => console.log(ids, users)}
/>
```

`value` is an array of extracted `item[fields.value]` primitives. `onchange` receives `(values: unknown[], items: SelectItem[])`.

## Examples

### String options

```svelte
<script>
  import { MultiSelect } from '@rokkit/ui'
  const options = ['React', 'Vue', 'Svelte', 'Angular']
  let value = $state([])
</script>

<MultiSelect {options} bind:value />
```

### Object options

```svelte
<MultiSelect
  options={tags}
  fields={{ text: 'label', value: 'id' }}
  bind:value={selectedTagIds}
  maxDisplay={5}
/>
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-multiselect` | Root | Always |
| `data-multiselect-open` | Root | Dropdown open |
| `data-select-item` | Option | Always |
| `data-selected` | Option | Currently selected |
| `data-focused` | Option | Keyboard focused |

## Notes

- Tags shown in trigger display are capped at `maxDisplay`; remaining shown as "+N more".
- Selecting an already-selected item deselects it (toggle behavior).
- Keyboard: `Backspace` on trigger removes last selected tag.
