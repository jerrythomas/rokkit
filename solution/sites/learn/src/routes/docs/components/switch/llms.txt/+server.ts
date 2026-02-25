import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Switch Component

> Data-driven switch component for cycling through multiple options with keyboard navigation.

The Switch component displays a horizontal list of clickable options where one is always selected. It supports any number of options (minimum 2), full keyboard navigation, and adapts to any data structure through field mapping.

## Quick Start

\`\`\`svelte
<script>
  import { Switch } from '@rokkit/ui'

  let options = ['Light', 'Dark', 'System']
  let value = $state('Light')
</script>

<Switch {options} bind:value />
\`\`\`

## Core Concepts

### Data-Driven Design

Switch adapts to your data structure through field mapping:

\`\`\`svelte
<script>
  const themes = [
    { id: 'light', name: 'Light Mode', icon: 'sun' },
    { id: 'dark', name: 'Dark Mode', icon: 'moon' },
    { id: 'auto', name: 'Auto', icon: 'monitor' }
  ]

  const fields = {
    text: 'name',
    icon: 'icon'
  }

  let selected = $state(themes[0])
</script>

<Switch options={themes} {fields} bind:value={selected} />
\`\`\`

### Proxy System

Each option is wrapped in a Proxy for consistent data access:

\`\`\`svelte
<Switch {options} {fields}>
  {#snippet child(proxy)}
    <div class="option">
      {#if proxy.has('icon')}
        <Icon name={proxy.get('icon')} />
      {/if}
      <span>{proxy.get('text')}</span>
    </div>
  {/snippet}
</Switch>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`array\` | \`[false, true]\` | Array of options (minimum 2) |
| \`value\` | \`any\` | \`undefined\` | Selected value (use \`bind:value\`) |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`description\` | \`string\` | \`'Toggle Switch'\` | Aria-label for accessibility |
| \`compact\` | \`boolean\` | \`false\` | Compact display mode |
| \`disabled\` | \`boolean\` | \`false\` | Disable interaction |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`child\` | \`Snippet\` | \`undefined\` | Custom option renderer |

## Field Mapping

Map your data fields to component expectations:

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Display text |
| \`icon\` | \`'icon'\` | Icon name |
| \`image\` | \`'image'\` | Image URL |
| \`label\` | \`'label'\` | Aria-label |

## Events

| Handler | Payload | Description |
|---------|---------|-------------|
| \`onchange\` | \`value\` | Fired when selection changes |

### Event Handling

\`\`\`svelte
<script>
  function handleChange(newValue) {
    console.log('Changed to:', newValue)
  }
</script>

<Switch {options} bind:value onchange={handleChange} />
\`\`\`

## Snippets

### Custom Option Rendering

\`\`\`svelte
<Switch {options} {fields}>
  {#snippet child(proxy)}
    <div class="custom-option">
      {#if proxy.has('icon')}
        <Icon name={proxy.get('icon')} size={16} />
      {/if}
      <span class="label">{proxy.get('text')}</span>
      {#if proxy.value.badge}
        <span class="badge">{proxy.value.badge}</span>
      {/if}
    </div>
  {/snippet}
</Switch>
\`\`\`

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`ArrowRight\` | Next option |
| \`ArrowDown\` | Next option |
| \`ArrowLeft\` | Previous option |
| \`ArrowUp\` | Previous option |
| \`Space\` | Next option |
| \`Enter\` | Next option |

Navigation wraps around at boundaries (cyclic).

## Switch vs Toggle

| Aspect | Switch | Toggle |
|--------|--------|--------|
| UI Pattern | Horizontal list of options | Single button |
| Options | 2+ items, any type | 2+ items |
| Selection | Click any option directly | Click to cycle |
| Visual | Each option visible | Shows current state |
| Use Case | Theme, view mode, etc. | Simple on/off |

## Boolean Switch

For simple on/off toggling:

\`\`\`svelte
<script>
  let enabled = $state(false)
</script>

<!-- Default options are [false, true] -->
<Switch bind:value={enabled} />

<!-- Or with custom labels -->
<Switch
  options={[
    { text: 'Off', value: false },
    { text: 'On', value: true }
  ]}
  fields={{ text: 'text' }}
  bind:value={enabled}
/>
\`\`\`

## Accessibility

- \`role="listbox"\` on container
- \`role="option"\` on each option
- \`aria-selected\` reflects selection state
- \`aria-label\` from \`description\` prop
- \`aria-orientation="horizontal"\`
- \`aria-disabled\` when disabled
- Full keyboard navigation

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`data-switch-root\` | Root | Main container |
| \`data-switch-item\` | Option | Individual option |
| \`data-switch-mark\` | Marker | Selection indicator |
| \`data-switch-on\` | Root | When "on" (2-option) |
| \`data-switch-off\` | Root | When "off" (2-option) |
| \`data-switch-compact\` | Root | Compact mode |

### Styling Example

\`\`\`css
[data-switch-root] {
  display: inline-flex;
  background: var(--surface-100);
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

[data-switch-item] {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

[data-switch-item][aria-selected="true"] {
  background: var(--primary);
  color: white;
}

[data-switch-root][data-switch-compact] [data-switch-item] {
  padding: 4px 8px;
}

[data-switch-root][aria-disabled="true"] {
  opacity: 0.5;
  pointer-events: none;
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { Switch } from '@rokkit/ui'

// Default import
import Switch from '@rokkit/ui/switch'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface SwitchProps {
  options?: any[]
  value?: any
  fields?: FieldMapping
  description?: string
  compact?: boolean
  disabled?: boolean
  class?: string
  child?: Snippet<[Proxy]>
  onchange?: (value: any) => void
}

interface FieldMapping {
  text?: string
  icon?: string
  image?: string
  label?: string
  [key: string]: string | undefined
}
\`\`\`

## Examples

### Theme Switcher

\`\`\`svelte
<script>
  import { Switch } from '@rokkit/ui'

  let theme = $state('light')

  const options = [
    { id: 'light', text: 'Light', icon: 'sun' },
    { id: 'dark', text: 'Dark', icon: 'moon' },
    { id: 'system', text: 'System', icon: 'monitor' }
  ]
</script>

<Switch {options} bind:value={theme} fields={{ text: 'text', icon: 'icon' }} />
\`\`\`

### View Mode Selector

\`\`\`svelte
<script>
  let view = $state('grid')
  const options = ['list', 'grid', 'table']
</script>

<Switch {options} bind:value={view}>
  {#snippet child(proxy)}
    <Icon name={proxy.value} />
  {/snippet}
</Switch>
\`\`\`

### Compact Boolean Toggle

\`\`\`svelte
<script>
  let notifications = $state(true)
</script>

<label>
  Notifications
  <Switch
    options={['Off', 'On']}
    value={notifications ? 'On' : 'Off'}
    onchange={(v) => notifications = v === 'On'}
    compact
  />
</label>
\`\`\`

### Multiple Options

\`\`\`svelte
<script>
  const speeds = ['0.5x', '1x', '1.5x', '2x']
  let playbackSpeed = $state('1x')
</script>

<Switch options={speeds} bind:value={playbackSpeed} description="Playback speed" />
\`\`\`

## Related Components

- **Toggle** - Single button toggle (shows current state only)
- **RadioGroup** - Vertical list of radio buttons
- **Tabs** - Tab-based selection with content panels
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
