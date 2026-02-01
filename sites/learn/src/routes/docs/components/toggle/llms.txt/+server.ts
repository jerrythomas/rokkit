import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Toggle Component

> Multi-option toggle button that cycles through values.

The Toggle component provides a button that cycles through a set of options, displaying the current value with support for field mapping and keyboard navigation.

## Quick Start

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let theme = $state('light')
</script>

<Toggle
  bind:value={theme}
  options={['light', 'dark', 'system']}
/>
\`\`\`

## Core Concepts

### Boolean Toggle

The simplest use case - toggle between true/false:

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let enabled = $state(false)
</script>

<Toggle bind:value={enabled} />
<!-- Toggles between false and true -->
\`\`\`

### Multi-Option Toggle

Cycle through multiple options:

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let size = $state('medium')
  const sizes = ['small', 'medium', 'large', 'xl']
</script>

<Toggle bind:value={size} options={sizes} />
\`\`\`

### Object Options with Field Mapping

Use complex objects with field mapping:

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let status = $state({ id: 'active', label: 'Active', icon: 'check' })

  const statuses = [
    { id: 'active', label: 'Active', icon: 'check' },
    { id: 'pending', label: 'Pending', icon: 'clock' },
    { id: 'inactive', label: 'Inactive', icon: 'x' }
  ]

  const fields = { text: 'label', icon: 'icon' }
</script>

<Toggle bind:value={status} options={statuses} {fields} />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`any\` | \`null\` | Current value (use \`bind:value\`) |
| \`options\` | \`array\` | \`[false, true]\` | Available options |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`disabled\` | \`boolean\` | \`false\` | Disables the toggle |
| \`square\` | \`boolean\` | \`false\` | Square button shape |
| \`label\` | \`string\` | \`'toggle'\` | Accessible label |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`onchange\` | \`function\` | \`undefined\` | Change handler |

## Field Mapping

When using object options, map fields for display:

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Display text |
| \`icon\` | \`'icon'\` | Icon to display |
| \`value\` | \`'value'\` | Value identifier |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`Enter\` / \`Space\` | Toggle to next value |
| \`ArrowRight\` / \`ArrowDown\` | Next option |
| \`ArrowLeft\` / \`ArrowUp\` | Previous option |

## Component Structure

\`\`\`
<div data-toggle-root>
└── <button>
    └── <Item>    // Displays current value
</div>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`data-toggle-root\` | div | Main container |
| \`data-disabled\` | div | Disabled state |
| \`data-square\` | div | Square shape variant |

### Styling Example

\`\`\`css
[data-toggle-root] {
  display: inline-flex;
}

[data-toggle-root] button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--surface-100);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

[data-toggle-root] button:hover {
  background: var(--surface-200);
}

[data-toggle-root] button:active {
  background: var(--surface-300);
}

[data-toggle-root][data-disabled="true"] button {
  opacity: 0.5;
  cursor: not-allowed;
}

[data-toggle-root][data-square="true"] button {
  border-radius: 0;
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { Toggle } from '@rokkit/ui'

// Default import
import Toggle from '@rokkit/ui/toggle'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface ToggleProps {
  value?: any
  options?: any[]
  fields?: FieldMapping
  disabled?: boolean
  square?: boolean
  label?: string
  class?: string
  onchange?: (value: any) => void
}
\`\`\`

## Examples

### Boolean Toggle

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let notifications = $state(true)
</script>

<label>
  Notifications
  <Toggle bind:value={notifications} />
</label>

<p>Notifications are {notifications ? 'enabled' : 'disabled'}</p>
\`\`\`

### Theme Switcher

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let theme = $state('system')
  const themes = [
    { id: 'light', text: '☀️ Light' },
    { id: 'dark', text: '🌙 Dark' },
    { id: 'system', text: '💻 System' }
  ]

  const fields = { text: 'text', value: 'id' }
</script>

<Toggle bind:value={theme} options={themes} {fields} />
\`\`\`

### Status Toggle

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let status = $state('draft')
  const statuses = ['draft', 'review', 'published', 'archived']
</script>

<div class="status-control">
  <span>Status:</span>
  <Toggle bind:value={status} options={statuses} />
</div>
\`\`\`

### With Icons

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let viewMode = $state('grid')
  const modes = [
    { value: 'grid', icon: 'grid', text: 'Grid' },
    { value: 'list', icon: 'list', text: 'List' },
    { value: 'table', icon: 'table', text: 'Table' }
  ]
</script>

<Toggle bind:value={viewMode} options={modes} fields={{ icon: 'icon', text: 'text' }} />
\`\`\`

### Controlled with Change Handler

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let priority = $state('normal')
  const priorities = ['low', 'normal', 'high', 'urgent']

  function handleChange(newValue) {
    console.log('Priority changed to:', newValue)
    // Perform side effects
  }
</script>

<Toggle
  bind:value={priority}
  options={priorities}
  onchange={handleChange}
/>
\`\`\`

### Disabled Toggle

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let locked = $state('read-only')
</script>

<Toggle value={locked} options={['read-only', 'editable']} disabled />
\`\`\`

### Square Toggle

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  let alignment = $state('left')
</script>

<Toggle
  bind:value={alignment}
  options={['left', 'center', 'right']}
  square
/>
\`\`\`

## Comparison with Switch

| Feature | Toggle | Switch |
|---------|--------|--------|
| Options | Multiple (2+) | Boolean only |
| Display | Shows current value | On/Off indicator |
| Use case | Cycle through states | Enable/disable |

## Related Components

- **Switch** - Boolean on/off toggle
- **CheckBox** - Boolean checkbox
- **RadioGroup** - Select one from visible options
- **Select** - Dropdown selection
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
