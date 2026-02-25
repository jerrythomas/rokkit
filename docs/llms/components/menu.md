# Menu

> Action dropdown menu with keyboard navigation, icons, grouped items, and custom snippets.

**Export**: `Menu` from `@rokkit/ui`
**Navigation**: `ListController` + `navigator` (Pattern A)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MenuItem[]` | `[]` | Menu items |
| `fields` | `Partial<MenuFields>` | — | Field mapping |
| `label` | `string` | — | Trigger button label |
| `icon` | `string` | — | Trigger button icon CSS class |
| `showArrow` | `boolean` | `true` | Show dropdown arrow on trigger |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `align` | `'left' \| 'right'` | `'left'` | Dropdown horizontal alignment |
| `direction` | `'down' \| 'up'` | `'down'` | Dropdown vertical direction |
| `disabled` | `boolean` | `false` | Disables trigger |
| `icons` | `Partial<MenuStateIcons>` | — | Override icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |
| `onselect` | `(value, item) => void` | — | Called on item selection |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `trigger` | `(open)` | Custom trigger button |
| `item` | `(item, fields, handlers)` | Custom item renderer |
| `groupLabel` | `(item, fields)` | Custom group header |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Item label |
| `value` | `'value'` | Selection value |
| `icon` | `'icon'` | Item icon |
| `description` | `'description'` | Secondary text |
| `disabled` | `'disabled'` | Disabled flag |
| `children` | `'children'` | Group children |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter / Space` | Open menu / select focused |
| `ArrowUp / ArrowDown` | Move focus |
| `Home / End` | First / last item |
| `Escape` | Close menu |

## Examples

### Basic

```svelte
<script>
  import { Menu } from '@rokkit/ui'
  const options = [
    { text: 'Edit', value: 'edit', icon: 'i-edit' },
    { text: 'Delete', value: 'delete', icon: 'i-trash' },
  ]
</script>

<Menu {options} label="Actions" onselect={(v) => handleAction(v)} />
```

### With groups

```svelte
<Menu
  options={[
    { text: 'File', children: [{ text: 'New', value: 'new' }, { text: 'Open', value: 'open' }] },
    { text: 'Edit', children: [{ text: 'Copy', value: 'copy' }] }
  ]}
  icon="i-menu"
  onselect={handleAction}
/>
```

### Custom trigger

```svelte
{#snippet trigger(open)}
  <button class:active={open}>
    <span class="i-dots-vertical"></span>
  </button>
{/snippet}

<Menu {options} {trigger} onselect={handleAction} />
```

### Custom item snippet

```svelte
{#snippet customItem(item, fields, handlers)}
  <div data-path={handlers.path} class="menu-item">
    <span class={item.icon}></span>
    <span>{item.text}</span>
    {#if item.shortcut}<kbd>{item.shortcut}</kbd>{/if}
  </div>
{/snippet}

<Menu {options} item={customItem} onselect={handleAction} />
```

## Notes

- Menu closes on item selection, outside click, and `Escape`.
- Groups flatten their children into the controller — keyboard navigation visits all leaf items regardless of groups.
- Do not add `onclick` on items with `data-path` — navigator handles all clicks.
