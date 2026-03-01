import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Toggle Component

> Segmented control for switching between a set of options with keyboard navigation.

The Toggle component renders options as a horizontal button group (radio-style). One option is selected at a time. Use it for mode switches, view selectors, or any small option set.

## Architecture

Toggle uses the Wrapper + Navigator pattern:
- \`Wrapper\` from \`@rokkit/states\` — manages data, focus, and selection
- \`Navigator\` from \`@rokkit/actions\` — handles keyboard/mouse interaction (horizontal orientation)
- \`resolveSnippet\` from \`@rokkit/core\` — custom item rendering via snippet overrides

## Quick Start

\`\`\`svelte
<script>
  import { Toggle } from '@rokkit/ui'

  const options = [
    { label: 'Day',   value: 'day',   icon: 'i-lucide:sun' },
    { label: 'Week',  value: 'week',  icon: 'i-lucide:calendar' },
    { label: 'Month', value: 'month', icon: 'i-lucide:calendar-range' }
  ]

  let value = $state('day')
</script>

<Toggle {options} bind:value />
\`\`\`

String arrays also work — each string becomes both the label and value:

\`\`\`svelte
<Toggle options={['Daily', 'Weekly', 'Monthly']} bind:value />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`unknown[]\` | \`[]\` | Array of toggle options (strings or objects) |
| \`fields\` | \`Record<string, string>\` | \`{}\` | Field mapping overrides |
| \`value\` | \`unknown\` | — | Selected value — use \`bind:value\` |
| \`onchange\` | \`(value, rawItem) => void\` | — | Called when selection changes |
| \`showLabels\` | \`boolean\` | \`true\` | Show text labels alongside icons |
| \`size\` | \`'sm'\\|'md'\\|'lg'\` | \`'md'\` | Size variant |
| \`disabled\` | \`boolean\` | \`false\` | Disable all options |
| \`class\` | \`string\` | \`''\` | Additional CSS classes |

## Field Mapping

Toggle uses BASE_FIELDS from \`@rokkit/core\`. Semantic keys map to common raw data keys:

| Semantic Key | Default Raw Key | Description |
|-------------|----------------|-------------|
| \`label\` | \`'text'\` | Display label |
| \`value\` | \`'value'\` | Option value emitted on selection |
| \`icon\` | \`'icon'\` | Icon class name |
| \`disabled\` | \`'disabled'\` | Disabled state |
| \`subtext\` | \`'description'\` | Tooltip text |

Override with the \`fields\` prop:

\`\`\`svelte
<Toggle options={items} fields={{ label: 'name', value: 'id' }} bind:value />
\`\`\`

## Icon-Only Mode

Set \`showLabels={false}\` to show only icons:

\`\`\`svelte
<script>
  const modes = [
    { value: 'system', icon: 'i-lucide:monitor', label: 'System' },
    { value: 'light',  icon: 'i-lucide:sun',     label: 'Light' },
    { value: 'dark',   icon: 'i-lucide:moon',    label: 'Dark' }
  ]
  let value = $state('system')
</script>

<Toggle options={modes} bind:value showLabels={false} />
\`\`\`

When \`showLabels={false}\`, each option's \`label\` is used as tooltip text via the \`title\` attribute.

## Disabled Options

Individual options can be disabled via the \`disabled\` field:

\`\`\`svelte
<script>
  const options = [
    { label: 'Edit',  value: 'edit' },
    { label: 'View',  value: 'view' },
    { label: 'Admin', value: 'admin', disabled: true }
  ]
  let value = $state('edit')
</script>

<Toggle {options} bind:value />
\`\`\`

## Custom Item Snippet

Override the default rendering with an \`itemContent\` snippet:

\`\`\`svelte
<Toggle {options} bind:value>
  {#snippet itemContent(proxy)}
    <span class={proxy.get('icon')}></span>
    <strong>{proxy.label}</strong>
  {/snippet}
</Toggle>
\`\`\`

The snippet receives a \`ProxyItem\` instance. Use \`proxy.label\`, \`proxy.value\`, \`proxy.get('icon')\`, etc.

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`ArrowLeft\` | Previous option |
| \`ArrowRight\` | Next option |
| \`Home\` | First option |
| \`End\` | Last option |
| \`Enter / Space\` | Select focused option |
| \`Tab\` | Move focus away |

## Accessibility

- \`role="radiogroup"\` on container
- \`role="radio"\` + \`aria-checked\` on each option
- \`aria-label\` derived from item label
- \`title\` attribute for tooltip (from subtext or label)
- Disabled options have \`disabled\` attribute + \`aria-disabled\`

## Data Attributes

| Attribute | Element | Description |
|-----------|---------|-------------|
| \`data-toggle\` | Container | Root element |
| \`data-toggle-option\` | Button | Individual option |
| \`data-toggle-size\` | Container | Size variant (sm/md/lg) |
| \`data-toggle-disabled\` | Container | All options disabled |
| \`data-toggle-labels\` | Container | Labels visible |
| \`data-selected\` | Button | Currently selected option |
| \`data-disabled\` | Button | Individually disabled option |
| \`data-path\` | Button | Item path key for Navigator |
| \`data-toggle-icon\` | Span | Icon element |
| \`data-toggle-label\` | Span | Label element |

## Import

\`\`\`javascript
import { Toggle } from '@rokkit/ui'
\`\`\`

## Related Components

- [List](/docs/components/list/llms.txt) — vertical list with selection
- [Tabs](/docs/components/tabs/llms.txt) — tabbed content panels
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
