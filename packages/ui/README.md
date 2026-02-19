# @rokkit/ui

Data driven UI components for Rokkit applications.

## Installation

```bash
pnpm add @rokkit/ui
```

## Components

### Menu

A flexible, data-driven dropdown menu component with support for:

- Flat or grouped menu items
- Custom field mapping for any data structure
- Icons, descriptions, and disabled states
- Size variants (sm, md, lg)
- Keyboard navigation
- Full accessibility (ARIA)

```svelte
<script>
  import { Menu } from '@rokkit/ui'

  const options = [
    { text: 'Copy', icon: 'i-solar:copy-bold', value: 'copy' },
    { text: 'Paste', icon: 'i-solar:clipboard-bold', value: 'paste' },
    { text: 'Delete', icon: 'i-solar:trash-bold', value: 'delete', disabled: true }
  ]

  function handleSelect(value, item) {
    console.log('Selected:', value, item)
  }
</script>

<Menu {options} label="Actions" icon="i-solar:menu-dots-bold" onselect={handleSelect} />
```

#### Grouped Options

```svelte
<script>
  const groupedOptions = [
    {
      text: 'Image',
      children: [
        { text: 'Export as PNG', value: 'png' },
        { text: 'Export as SVG', value: 'svg' }
      ]
    },
    {
      text: 'Data',
      children: [
        { text: 'Export as CSV', value: 'csv' },
        { text: 'Export as JSON', value: 'json' }
      ]
    }
  ]
</script>

<Menu options={groupedOptions} label="Export" />
```

#### Custom Field Mapping

Use the `fields` prop to map your data structure to Menu's expected fields:

```svelte
<script>
  const items = [
    { name: 'Option A', id: 'a' },
    { name: 'Option B', id: 'b' }
  ]

  const fields = {
    text: 'name',
    value: 'id'
  }
</script>

<Menu options={items} {fields} label="Select" />
```

### Custom Item Rendering

Use snippets to customize how menu items and group labels are rendered:

```svelte
<script>
  import { Menu } from '@rokkit/ui'

  const options = [
    { text: 'Normal Item', value: 'normal' },
    { text: 'Premium Feature', value: 'premium', snippet: 'premium' },
    { text: 'Special Offer', value: 'special', snippet: 'special' }
  ]
</script>

<Menu {options}>
  {#snippet item(menuItem, fields, handlers)}
    <button onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
      🎯 {menuItem.text}
    </button>
  {/snippet}

  {#snippet groupLabel(group, fields)}
    <div class="custom-header">
      📁 {group.text}
    </div>
  {/snippet}

  {#snippet premium(menuItem, fields, handlers)}
    <button onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
      🔒 Premium: {menuItem.text}
    </button>
  {/snippet}

  {#snippet special(menuItem, fields, handlers)}
    <button onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
      ⭐ {menuItem.text}
    </button>
  {/snippet}
</Menu>
```

#### Snippet Resolution Order

1. **Per-item snippet**: If an item has a `snippet` field (e.g., `snippet: 'premium'`), the named snippet is used
2. **Generic `item` snippet**: Falls back to the `item` snippet if provided
3. **Default rendering**: Uses the built-in rendering if no custom snippet matches

#### Handlers Object

Custom snippets receive a `handlers` object with:

- `onclick: () => void` - Call to trigger item selection
- `onkeydown: (event) => void` - Forward keyboard events for accessibility

### Props

| Prop         | Type                    | Default  | Description                        |
| ------------ | ----------------------- | -------- | ---------------------------------- |
| `options`    | `MenuItem[]`            | `[]`     | Array of menu items or groups      |
| `fields`     | `MenuFields`            | `{}`     | Field mapping configuration        |
| `label`      | `string`                | `'Menu'` | Button label text                  |
| `icon`       | `string`                | -        | Button icon class                  |
| `showArrow`  | `boolean`               | `true`   | Show dropdown arrow indicator      |
| `size`       | `'sm' \| 'md' \| 'lg'`  | `'md'`   | Size variant                       |
| `align`      | `'left' \| 'right'`     | `'left'` | Dropdown alignment                 |
| `disabled`   | `boolean`               | `false`  | Disable the menu                   |
| `onselect`   | `(value, item) => void` | -        | Selection callback                 |
| `item`       | `Snippet`               | -        | Custom snippet for rendering items |
| `groupLabel` | `Snippet`               | -        | Custom snippet for group headers   |
| `class`      | `string`                | `''`     | Additional CSS classes             |

### CSS Custom Properties

```css
/* Trigger button */
--menu-trigger-bg
--menu-trigger-bg-hover
--menu-trigger-bg-active
--menu-trigger-border
--menu-trigger-border-hover
--menu-trigger-border-active
--menu-trigger-text
--menu-trigger-text-hover
--menu-focus-ring

/* Dropdown */
--menu-dropdown-bg
--menu-dropdown-border
--menu-dropdown-shadow

/* Items */
--menu-item-text
--menu-item-text-hover
--menu-item-bg-hover
--menu-item-bg-focus
--menu-item-icon
--menu-item-icon-hover
--menu-item-description

/* Groups */
--menu-group-label-color
--menu-divider-color
```

### Field Mapping

| Field         | Default         | Description               |
| ------------- | --------------- | ------------------------- |
| `text`        | `'text'`        | Display text field        |
| `value`       | `'value'`       | Value to emit on select   |
| `icon`        | `'icon'`        | Icon class field          |
| `description` | `'description'` | Secondary text field      |
| `disabled`    | `'disabled'`    | Disabled state field      |
| `children`    | `'children'`    | Children array for groups |
| `snippet`     | `'snippet'`     | Custom snippet name field |

## Types

All types are exported from the package:

```typescript
import type {
  MenuProps,
  MenuFields,
  MenuItem,
  MenuItemSnippet,
  MenuGroupLabelSnippet,
  MenuItemHandlers
} from '@rokkit/ui'
```

## License

MIT
