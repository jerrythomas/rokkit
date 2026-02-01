import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit DropDown Component

> Dropdown menu with trigger button and selectable options.

The DropDown component provides a button that reveals a list of selectable options when focused, with support for icons, field mapping, and automatic dismissal.

## Quick Start

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let options = ['Option 1', 'Option 2', 'Option 3']
  let selected = $state(null)
</script>

<DropDown {options} bind:value={selected} title="Select..." />
\`\`\`

## Core Concepts

### Basic Dropdown

Simple dropdown with title and options:

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let actions = ['Edit', 'Duplicate', 'Delete']
  let action = $state(null)
</script>

<DropDown options={actions} bind:value={action} title="Actions" />
\`\`\`

### With Icon

Add an icon to the dropdown trigger:

\`\`\`svelte
<DropDown
  options={actions}
  bind:value={action}
  title="Actions"
  icon="fa-solid fa-ellipsis-v"
/>
\`\`\`

### Icon-Only (Small)

Compact dropdown showing only an icon:

\`\`\`svelte
<DropDown
  options={actions}
  icon="fa-solid fa-cog"
  small
/>
\`\`\`

### Object Options with Field Mapping

Use complex objects with field mapping:

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let users = [
    { id: 1, name: 'Alice', avatar: '/alice.jpg' },
    { id: 2, name: 'Bob', avatar: '/bob.jpg' }
  ]

  const fields = { text: 'name', image: 'avatar', value: 'id' }
  let selectedUser = $state(null)
</script>

<DropDown options={users} {fields} bind:value={selectedUser} title="Assign to" />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`array\` | \`[]\` | Available options |
| \`value\` | \`any\` | \`null\` | Selected value |
| \`fields\` | \`object\` | \`defaultFields\` | Field mapping |
| \`title\` | \`string\` | \`null\` | Trigger button text |
| \`icon\` | \`string\` | \`null\` | Trigger button icon |
| \`small\` | \`boolean\` | \`false\` | Icon-only compact mode |
| \`disabled\` | \`boolean\` | \`false\` | Disables dropdown |
| \`using\` | \`object\` | \`{ default: Item }\` | Custom item renderer |
| \`class\` | \`string\` | \`''\` | CSS class names |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Display text |
| \`value\` | \`'value'\` | Value identifier |
| \`icon\` | \`'icon'\` | Item icon |
| \`image\` | \`'image'\` | Item image |

## Component Structure

\`\`\`
<drop-down>
├── <button>                  // Trigger button
│   ├── <Icon>               // Optional icon
│   ├── <p>                  // Title text (unless small)
│   └── <Icon>               // Open/close indicator
└── <Slider>                 // Dropdown panel (when open)
    └── <List>               // Options list
        └── <Item>           // Each option
</drop-down>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`drop-down\` | Root | Custom element |
| \`.dropdown\` | Root | CSS class |
| \`.open\` | Root | When dropdown is open |
| \`aria-haspopup\` | Root | Accessibility |
| \`aria-controls\` | Root | Controls menu |

### Styling Example

\`\`\`css
drop-down {
  position: relative;
  display: inline-flex;
}

drop-down button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface-100);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

drop-down button:hover {
  background: var(--surface-200);
}

drop-down.open button {
  background: var(--surface-200);
  border-color: var(--primary-500);
}

drop-down button p {
  margin: 0;
}

/* Dropdown panel positioned by Slider */
drop-down :global([data-slider]) {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: var(--surface-50);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

drop-down :global([data-item]) {
  padding: 8px 12px;
}

drop-down :global([data-item]:hover) {
  background: var(--surface-100);
}
\`\`\`

## Behavior

- Opens on focus (click or tab)
- Closes on blur (click outside or tab away)
- Uses \`dismissable\` action for outside click detection
- Selection closes dropdown automatically

## Import

\`\`\`javascript
// Named import
import { DropDown } from '@rokkit/ui'

// Default import
import DropDown from '@rokkit/ui/drop-down'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface DropDownProps {
  options?: any[]
  value?: any
  fields?: FieldMapping
  title?: string
  icon?: string
  small?: boolean
  disabled?: boolean
  using?: { default: Component }
  class?: string
}
\`\`\`

## Examples

### Action Menu

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let actions = [
    { text: 'Edit', icon: 'edit' },
    { text: 'Duplicate', icon: 'copy' },
    { text: 'Delete', icon: 'trash' }
  ]

  function handleSelect(action) {
    console.log('Selected action:', action.text)
  }
</script>

<DropDown
  options={actions}
  title="Actions"
  icon="fa-solid fa-ellipsis-v"
  onselect={handleSelect}
/>
\`\`\`

### User Selector

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let team = [
    { id: 1, name: 'Alice', role: 'Developer' },
    { id: 2, name: 'Bob', role: 'Designer' },
    { id: 3, name: 'Charlie', role: 'Manager' }
  ]

  const fields = { text: 'name', value: 'id' }
  let assignee = $state(null)
</script>

<DropDown
  options={team}
  {fields}
  bind:value={assignee}
  title="Assign to..."
  icon="fa-solid fa-user"
/>
\`\`\`

### Icon-Only Menu

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let options = ['Settings', 'Help', 'Logout']
</script>

<DropDown
  {options}
  icon="fa-solid fa-cog"
  small
/>
\`\`\`

### Navigation Menu

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let navItems = [
    { text: 'Dashboard', href: '/dashboard' },
    { text: 'Projects', href: '/projects' },
    { text: 'Settings', href: '/settings' }
  ]

  let current = $state(null)
</script>

<DropDown
  options={navItems}
  bind:value={current}
  title="Navigate"
/>
\`\`\`

### Sort Options

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let sortOptions = [
    { text: 'Name (A-Z)', value: 'name_asc' },
    { text: 'Name (Z-A)', value: 'name_desc' },
    { text: 'Date (Newest)', value: 'date_desc' },
    { text: 'Date (Oldest)', value: 'date_asc' }
  ]

  let sortBy = $state('date_desc')
</script>

<DropDown
  options={sortOptions}
  bind:value={sortBy}
  title="Sort by"
  icon="fa-solid fa-sort"
/>
\`\`\`

### With Custom Renderer

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'
  import CustomItem from './CustomItem.svelte'

  let options = [...]
</script>

<DropDown
  {options}
  using={{ default: CustomItem }}
  title="Select"
/>
\`\`\`

### Disabled State

\`\`\`svelte
<script>
  import { DropDown } from '@rokkit/ui'

  let options = ['Option 1', 'Option 2']
  let isLocked = $state(true)
</script>

<DropDown
  {options}
  title="Locked"
  disabled={isLocked}
/>
\`\`\`

## Comparison with Select

| Feature | DropDown | Select |
|---------|----------|--------|
| Trigger | Button with icon/title | Selected value display |
| Open on | Focus | Click |
| Use case | Action menus | Form input |
| Appearance | Button style | Input style |

## Related Components

- **Select** - Form-style dropdown for selection
- **List** - Used internally for options
- **Button** - Similar trigger appearance
- **FloatingActions** - Alternative action menu
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
