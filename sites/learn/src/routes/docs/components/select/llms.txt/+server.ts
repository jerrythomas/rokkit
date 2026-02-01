import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Select Component

> Data-driven dropdown select component with keyboard navigation and field mapping.

The Select component provides a dropdown selection interface that adapts to any data structure through field mapping, supports keyboard navigation, and includes animated transitions.

## Quick Start

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let options = ['Apple', 'Banana', 'Cherry', 'Date']
  let value = $state(null)
</script>

<Select {options} bind:value placeholder="Select a fruit..." />
\`\`\`

## Core Concepts

### Data-Driven Design

Select adapts to your data structure through field mapping:

\`\`\`svelte
<script>
  const users = [
    { userId: 1, fullName: 'John Doe', avatar: '/john.jpg' },
    { userId: 2, fullName: 'Jane Smith', avatar: '/jane.jpg' }
  ]

  const fields = {
    value: 'userId',
    text: 'fullName',
    image: 'avatar'
  }

  let selected = $state(null)
</script>

<Select options={users} {fields} bind:value={selected} />
\`\`\`

### Proxy System

The component uses the Proxy system for consistent data access:

\`\`\`svelte
<Select {options} {fields}>
  {#snippet currentItem(value, fields)}
    <!-- Access mapped fields through Proxy -->
    <div class="selected-display">
      <img src={value.avatar} alt="" />
      <span>{value.fullName}</span>
    </div>
  {/snippet}
</Select>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`array\` | \`[]\` | Array of items (use \`bind:options\`) |
| \`value\` | \`any\` | \`null\` | Selected value (use \`bind:value\`) |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`placeholder\` | \`string\` | \`''\` | Text when no selection |
| \`name\` | \`string\` | \`null\` | Aria-label for accessibility |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`open\` | \`boolean\` | \`false\` | Dropdown open state (use \`bind:open\`) |
| \`disabled\` | \`boolean\` | \`false\` | Disables the select |
| \`tabindex\` | \`number\` | \`0\` | Tab index for focus order |
| \`direction\` | \`'up' \\| 'down' \\| 'auto'\` | \`'auto'\` | Dropdown opening direction |
| \`searchable\` | \`boolean\` | \`false\` | Enables search/filter input |
| \`searchText\` | \`string\` | \`''\` | Current search text (use \`bind:searchText\`) |
| \`searchPlaceholder\` | \`string\` | \`'Search...'\` | Placeholder for search input |
| \`filterFn\` | \`function\` | \`undefined\` | Custom filter function |
| \`currentItem\` | \`Snippet\` | \`undefined\` | Custom selected item renderer |

## Field Mapping

Map your data fields to component expectations:

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'value'\` | Unique identifier |
| \`text\` | \`'text'\` | Display text |
| \`icon\` | \`'icon'\` | Icon name or object |
| \`image\` | \`'image'\` | Image URL |
| \`label\` | \`'label'\` | Aria-label |

### Field Mapping Example

\`\`\`svelte
<script>
  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' }
  ]

  const fields = {
    value: 'code',
    text: 'name',
    icon: 'flag'
  }
</script>

<Select options={countries} {fields} bind:value />
\`\`\`

## Events

| Handler | Event | Payload | Description |
|---------|-------|---------|-------------|
| \`onselect\` | select | \`value\` | Fired when option selected |
| \`onchange\` | change | \`value\` | Fired when value changes |

### Event Handling

\`\`\`svelte
<script>
  function handleSelect(value) {
    console.log('Selected:', value)
  }

  function handleChange(value) {
    console.log('Changed to:', value)
  }
</script>

<Select {options} onselect={handleSelect} onchange={handleChange} />
\`\`\`

## Searchable Select

Enable search/filter functionality to help users find options in large lists:

### Basic Searchable

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let countries = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' }
  ]

  const fields = { value: 'code', text: 'name' }
  let selected = $state(null)
</script>

<Select
  options={countries}
  {fields}
  bind:value={selected}
  searchable
  searchPlaceholder="Search countries..."
/>
\`\`\`

### Custom Filter Function

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let products = [
    { id: 1, name: 'Widget Pro', sku: 'WGT-001' },
    { id: 2, name: 'Gadget Plus', sku: 'GDG-002' },
    { id: 3, name: 'Gizmo Elite', sku: 'GZM-003' }
  ]

  // Custom filter: search by name or SKU
  function customFilter(item, searchText) {
    const search = searchText.toLowerCase()
    return item.name.toLowerCase().includes(search) ||
           item.sku.toLowerCase().includes(search)
  }
</script>

<Select
  options={products}
  fields={{ value: 'id', text: 'name' }}
  searchable
  filterFn={customFilter}
/>
\`\`\`

### Controlled Search Text

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let options = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
  let value = $state(null)
  let searchText = $state('')

  // React to search text changes
  $effect(() => {
    console.log('User searching for:', searchText)
  })
</script>

<Select
  {options}
  bind:value
  searchable
  bind:searchText
/>

<p>Current search: {searchText}</p>
\`\`\`

## Dropdown Direction

Control which direction the dropdown opens:

### Direction Options

| Value | Behavior |
|-------|----------|
| \`'auto'\` | Automatically detects best direction based on viewport space |
| \`'down'\` | Always opens downward |
| \`'up'\` | Always opens upward |

### Auto Direction (Default)

\`\`\`svelte
<!-- Automatically opens up or down based on available space -->
<Select {options} direction="auto" />
\`\`\`

### Fixed Direction

\`\`\`svelte
<!-- Always opens upward (useful near bottom of page) -->
<Select {options} direction="up" />

<!-- Always opens downward -->
<Select {options} direction="down" />
\`\`\`

## Snippets

### Custom Selected Item Display

\`\`\`svelte
<Select {options} {fields}>
  {#snippet currentItem(value, fields)}
    <div class="custom-selected">
      {#if value}
        <img src={value.avatar} alt="" class="avatar" />
        <span>{value.name}</span>
        <span class="role">({value.role})</span>
      {:else}
        <span class="placeholder">Choose a user...</span>
      {/if}
    </div>
  {/snippet}
</Select>
\`\`\`

## Keyboard Navigation

Built-in keyboard support:

| Key | Action |
|-----|--------|
| \`ArrowDown\` | Open dropdown / Move to next option |
| \`ArrowUp\` | Open dropdown / Move to previous option |
| \`Enter\` | Select current option |
| \`Space\` | Select current option |
| \`Escape\` | Close dropdown |

## Component Structure

\`\`\`
<input-select>
├── <selected-item>        // Shows current selection
│   ├── <Item>            // Selected item display
│   └── <Icon>            // Dropdown arrow indicator
└── <Slider>              // Animated dropdown (when open)
    └── <List>            // Options list
        └── <ListBody>    // Option items
\`\`\`

## Accessibility

- \`role="listbox"\` on root element
- \`aria-label\` from \`name\` prop
- \`role="option"\` on each item
- \`aria-selected\` reflects selection state
- Full keyboard navigation
- Focus management

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`input-select\` | Root | Main select container |
| \`selected-item\` | Display | Selected value display |
| \`scroll\` | Dropdown | Dropdown container |
| \`open\` class | Root | When dropdown is visible |

### Styling Example

\`\`\`css
input-select {
  position: relative;
  display: inline-block;
  min-width: 200px;
}

selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}

input-select.open selected-item {
  border-color: var(--focus-color);
  box-shadow: 0 0 0 2px var(--focus-ring);
}

scroll {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: var(--dropdown-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: var(--dropdown-shadow);
  z-index: 100;
}
\`\`\`

## Visual States

### Open/Closed Indicator

The dropdown arrow icon changes based on state:
- Closed: \`selector-closed\` icon
- Open: \`selector-opened\` icon

Icons are from the \`defaultStateIcons.selector\` set in \`@rokkit/core\`.

## Import

\`\`\`javascript
// Named import
import { Select } from '@rokkit/ui'

// Default import
import Select from '@rokkit/ui/select'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface SelectProps {
  options?: any[]
  value?: any
  fields?: FieldMapping
  placeholder?: string
  name?: string
  class?: string
  open?: boolean
  disabled?: boolean
  tabindex?: number
  direction?: 'up' | 'down' | 'auto'
  searchable?: boolean
  searchText?: string
  searchPlaceholder?: string
  filterFn?: (item: any, searchText: string, fields: FieldMapping) => boolean
  currentItem?: Snippet<[any, FieldMapping]>
  onselect?: (value: any) => void
  onchange?: (value: any) => void
}

interface FieldMapping {
  value?: string
  text?: string
  icon?: string
  image?: string
  label?: string
  [key: string]: string | undefined
}
\`\`\`

## Examples

### Basic String Array

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let sizes = ['Small', 'Medium', 'Large', 'X-Large']
  let size = $state(null)
</script>

<Select options={sizes} bind:value={size} placeholder="Select size" />
\`\`\`

### Objects with Field Mapping

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let products = [
    { id: 1, name: 'Widget', price: 9.99 },
    { id: 2, name: 'Gadget', price: 19.99 },
    { id: 3, name: 'Gizmo', price: 14.99 }
  ]

  const fields = { value: 'id', text: 'name' }
  let selected = $state(null)
</script>

<Select options={products} {fields} bind:value={selected} />

{#if selected}
  <p>Selected: {selected.name} - \${selected.price}</p>
{/if}
\`\`\`

### With Images

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let users = [
    { id: 1, name: 'Alice', avatar: '/alice.jpg' },
    { id: 2, name: 'Bob', avatar: '/bob.jpg' }
  ]

  const fields = {
    text: 'name',
    image: 'avatar'
  }
</script>

<Select options={users} {fields} bind:value placeholder="Select user" />
\`\`\`

### Controlled Component

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let options = ['Option A', 'Option B', 'Option C']
  let value = $state('Option B')

  function reset() {
    value = null
  }
</script>

<Select {options} bind:value />
<button onclick={reset}>Reset</button>
\`\`\`

### Searchable with Many Options

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  // Large list benefits from search
  let allCountries = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    // ... many more countries
    { code: 'ZW', name: 'Zimbabwe' }
  ]

  let selected = $state(null)
</script>

<Select
  options={allCountries}
  fields={{ value: 'code', text: 'name' }}
  bind:value={selected}
  searchable
  searchPlaceholder="Type to search countries..."
  placeholder="Select a country"
/>
\`\`\`

### Direction Control for Bottom Placement

\`\`\`svelte
<script>
  import { Select } from '@rokkit/ui'

  let options = ['Option 1', 'Option 2', 'Option 3']
  let value = $state(null)
</script>

<!-- Fixed at bottom of viewport, opens upward -->
<div style="position: fixed; bottom: 20px;">
  <Select {options} bind:value direction="up" />
</div>
\`\`\`

## Related Components

- **MultiSelect** - For selecting multiple items
- **SearchFilter** - Standalone search/filter for List or Tree components
- **List** - Underlying list component used in dropdown
- **Item** - Item renderer used for options
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
