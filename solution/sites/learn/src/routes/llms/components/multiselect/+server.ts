import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit MultiSelect Component

> Dropdown component for selecting multiple items with pill/tag display.

MultiSelect extends Select for multi-item selection. Selected values are shown as removable pills inside the trigger. Supports grouping, typeahead filtering, and field mapping.

## Quick Start

\`\`\`svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  let options = ['JavaScript', 'TypeScript', 'Svelte', 'React', 'Vue']
  let value = $state([])
</script>

<MultiSelect {options} bind:value placeholder="Select languages..." />
<p>Selected: {value.join(', ')}</p>
\`\`\`

## Object Options

\`\`\`svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  const tags = [
    { id: 1, name: 'Frontend',  color: '#3b82f6' },
    { id: 2, name: 'Backend',   color: '#10b981' },
    { id: 3, name: 'DevOps',    color: '#f59e0b' }
  ]
  const fields = { value: 'id', text: 'name' }

  let value = $state([])
  let selected = $state([])
</script>

<MultiSelect options={tags} {fields} bind:value bind:selected />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`SelectItem[]\` | \`[]\` | Options array |
| \`fields\` | \`SelectFields\` | defaults | Field mapping |
| \`value\` | \`unknown[]\` | \`[]\` | Selected values array — use \`bind:value\` |
| \`selected\` | \`SelectItem[]\` | \`[]\` | Selected items — use \`bind:selected\` |
| \`placeholder\` | \`string\` | — | Placeholder when nothing selected |
| \`size\` | \`'sm'|'md'|'lg'\` | \`'md'\` | Size variant |
| \`align\` | \`'left'|'right'|'start'|'end'\` | \`'left'\` | Dropdown alignment |
| \`direction\` | \`'up'|'down'\` | \`'down'\` | Dropdown direction |
| \`maxRows\` | \`number\` | \`5\` | Visible rows in dropdown |
| \`maxDisplay\` | \`number\` | — | Max pills shown before "+N more" |
| \`disabled\` | \`boolean\` | \`false\` | Disable the component |
| \`filterable\` | \`boolean\` | \`false\` | Show typeahead filter input |
| \`filterPlaceholder\` | \`string\` | — | Placeholder for filter input |
| \`icons\` | \`SelectStateIcons\` | — | Override state icons |
| \`class\` | \`string\` | \`''\` | Additional CSS classes |

## Field Mapping

Same as [Select](/docs/components/select/llms.txt) — uses \`SelectFields\`:

| Field | Default |
|-------|---------|
| \`value\` | \`'value'\` |
| \`text\` | \`'text'\` |
| \`icon\` | \`'icon'\` |
| \`description\` | \`'description'\` |
| \`disabled\` | \`'disabled'\` |
| \`children\` | \`'children'\` |

## Callbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| \`onchange\` | \`(values[], items[]) => void\` | Selection changed |

## Max Display

Collapse excess pills to a "+N more" indicator:

\`\`\`svelte
<MultiSelect {options} bind:value maxDisplay={3} />
\`\`\`

## Snippets

### Custom Selected Values Display

\`\`\`svelte
<MultiSelect {options} bind:value>
  {#snippet selectedValues(items, fields)}
    <span>{items.length} selected</span>
  {/snippet}
</MultiSelect>
\`\`\`

## Keyboard Navigation

Same as Select:

| Key | Action |
|-----|--------|
| \`Enter/Space\` | Open dropdown |
| \`ArrowDown/Up\` | Navigate options |
| \`Enter\` | Toggle focused option |
| \`Escape\` | Close dropdown |
| \`Backspace\` | Remove last selected pill |

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| \`data-multiselect\` | Root element |
| \`data-select-trigger\` | Trigger area |
| \`data-select-pill\` | Selected value pill |
| \`data-select-dropdown\` | Dropdown container |
| \`data-open\` | Open state |

## Import

\`\`\`javascript
import { MultiSelect } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface MultiSelectProps {
  options?: SelectItem[]
  fields?: SelectFields
  value?: unknown[]
  selected?: SelectItem[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'right' | 'start' | 'end'
  direction?: 'up' | 'down'
  maxRows?: number
  maxDisplay?: number
  disabled?: boolean
  filterable?: boolean
  filterPlaceholder?: string
  icons?: SelectStateIcons
  class?: string
  onchange?: (values: unknown[], items: SelectItem[]) => void
  selectedValues?: Snippet<[SelectItem[], SelectFields]>
  item?: Snippet<[SelectItem, SelectFields, SelectItemHandlers, boolean]>
  groupLabel?: Snippet<[SelectItem, SelectFields]>
}
\`\`\`

## Related Components

- [Select](/docs/components/select/llms.txt) — single-item dropdown
- [List](/docs/components/list/llms.txt) — inline multi-selection
- [Toggle](/docs/components/toggle/llms.txt) — compact option group
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
