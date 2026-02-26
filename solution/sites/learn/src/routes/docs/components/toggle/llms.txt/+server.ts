import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Toggle Component

> Multi-option toggle group with keyboard navigation and field mapping.

The Toggle component renders a set of options as a button group (radio-style). One option is selected at a time. Use it for mode switches, view selectors, or any small option set.

## Quick Start

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  const options = [
    { text: 'Day',   value: 'day',   icon: 'i-lucide:sun' },
    { text: 'Week',  value: 'week',  icon: 'i-lucide:calendar' },
    { text: 'Month', value: 'month', icon: 'i-lucide:calendar-range' }
  ]

  let value = $state('day')
</script>

<Toggle {options} bind:value />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`ToggleItem[]\` | \`[]\` | Array of toggle options |
| \`fields\` | \`ToggleFields\` | defaults | Field mapping |
| \`value\` | \`unknown\` | — | Selected value — use \`bind:value\` |
| \`onchange\` | \`(value, item) => void\` | — | Called when selection changes |
| \`showLabels\` | \`boolean\` | \`true\` | Show text labels alongside icons |
| \`size\` | \`'sm'|'md'|'lg'\` | \`'md'\` | Size variant |
| \`disabled\` | \`boolean\` | \`false\` | Disable all options |
| \`class\` | \`string\` | \`''\` | Additional CSS classes |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'value'\` | Option value emitted on selection |
| \`text\` | \`'text'\` | Display label |
| \`icon\` | \`'icon'\` | Icon class name |
| \`disabled\` | \`'disabled'\` | Disabled state |
| \`description\` | \`'description'\` | Tooltip text |

## Icon-Only Mode

Set \`showLabels={false}\` to show only icons:

\`\`\`svelte
<script>
  const modes = [
    { value: 'system', icon: 'i-lucide:monitor', description: 'System' },
    { value: 'light',  icon: 'i-lucide:sun',     description: 'Light' },
    { value: 'dark',   icon: 'i-lucide:moon',    description: 'Dark' }
  ]
  let value = $state('system')
</script>

<Toggle options={modes} bind:value showLabels={false} />
\`\`\`

## Disabled Options

Individual options can be disabled via the \`disabled\` field:

\`\`\`svelte
<script>
  const options = [
    { text: 'Edit',   value: 'edit' },
    { text: 'View',   value: 'view' },
    { text: 'Admin',  value: 'admin', disabled: true }
  ]
  let value = $state('edit')
</script>

<Toggle {options} bind:value />
\`\`\`

## Custom Item Snippet

\`\`\`svelte
<Toggle {options} bind:value>
  {#snippet item(data, fields, handlers, selected)}
    <button
      onclick={handlers.onclick}
      onkeydown={handlers.onkeydown}
      data-toggle-option
      data-selected={selected || undefined}
    >
      <span class={data.icon}></span>
      <span>{data.text}</span>
    </button>
  {/snippet}
</Toggle>
\`\`\`

## Keyboard Navigation

The Toggle acts as a radio group:

| Key | Action |
|-----|--------|
| \`ArrowLeft/Up\` | Previous option |
| \`ArrowRight/Down\` | Next option |
| \`Enter/Space\` | Select focused option |
| \`Tab\` | Move focus away |

## Accessibility

- \`role="radiogroup"\` on container
- \`role="radio"\` on each option
- \`aria-checked\` on selected option
- \`aria-label\` from \`description\` field

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| \`data-toggle\` | Root container |
| \`data-toggle-option\` | Individual option |
| \`data-toggle-size\` | Size variant |
| \`data-toggle-disabled\` | Disabled state |
| \`data-toggle-labels\` | Labels visible |
| \`data-selected\` | Selected option |
| \`data-toggle-icon\` | Icon element |
| \`data-toggle-label\` | Label element |

## Import

\`\`\`javascript
import { Toggle } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface ToggleProps {
  options?: ToggleItem[]
  fields?: ToggleFields
  value?: unknown
  onchange?: (value: unknown, item: ToggleItem) => void
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  class?: string
  item?: Snippet<[ToggleItem, ToggleFields, ToggleItemHandlers, boolean]>
}

interface ToggleFields {
  value?: string       // default: 'value'
  text?: string        // default: 'text'
  icon?: string        // default: 'icon'
  disabled?: string    // default: 'disabled'
  description?: string // default: 'description'
}
\`\`\`

## Related Components

- [Switch](/docs/components/switch/llms.txt) — single boolean on/off switch
- [Tabs](/docs/components/tabs/llms.txt) — tabbed content panels
- [RadioGroup](/docs/components/radiogroup/llms.txt) — traditional radio button group
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
