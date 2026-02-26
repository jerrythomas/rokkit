import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit List Component

> Data-driven, accessible list component with keyboard navigation, selection, and collapsible groups.

The List component renders an array of items as a navigable list. Items can be plain buttons, navigation links (when \`href\` is present), or grouped with collapsible sections. Supports single and multi-selection.

## Quick Start

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'
  let items = ['Apple', 'Banana', 'Cherry']
  let value = $state(null)
</script>
<List {items} bind:value />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`ListItem[]\` | \`[]\` | Data array |
| \`fields\` | \`ListFields\` | defaults | Field mapping configuration |
| \`value\` | \`unknown\` | — | Selected value — use \`bind:value\` |
| \`size\` | \`'sm'|'md'|'lg'\` | \`'md'\` | Size variant |
| \`disabled\` | \`boolean\` | \`false\` | Disable all items |
| \`collapsible\` | \`boolean\` | \`false\` | Allow groups to be collapsed |
| \`multiselect\` | \`boolean\` | \`false\` | Enable multi-selection |
| \`expanded\` | \`Record<string,boolean>\` | \`{}\` | Expanded groups — use \`bind:expanded\` |
| \`selected\` | \`unknown[]\` | \`[]\` | Selected values (multiselect) — use \`bind:selected\` |
| \`active\` | \`unknown\` | — | Highlight item by value (e.g. current route) |
| \`icons\` | \`ListStateIcons\` | — | Override expand/collapse icons |
| \`class\` | \`string\` | \`''\` | Additional CSS classes |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'value'\` | Selection value |
| \`text\` | \`'text'\` | Display text |
| \`href\` | \`'href'\` | URL — renders item as \`<a>\` |
| \`icon\` | \`'icon'\` | Icon class name |
| \`description\` | \`'description'\` | Secondary/subtitle text |
| \`label\` | \`'label'\` | Aria-label override |
| \`disabled\` | \`'disabled'\` | Disabled state |
| \`children\` | \`'children'\` | Nested items array (groups) |
| \`snippet\` | \`'snippet'\` | Named item snippet |
| \`badge\` | \`'badge'\` | Badge/count indicator |

## Navigation Links

Items with an \`href\` field render as \`<a>\` tags. Use \`active\` to highlight the current route:

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'
  import { page } from '$app/state'

  const nav = [
    { text: 'Home',     href: '/',         icon: 'i-lucide:home' },
    { text: 'Settings', href: '/settings', icon: 'i-lucide:settings' }
  ]
</script>
<List items={nav} active={page.url.pathname} />
\`\`\`

## Grouped Items with Collapsible Sections

Items with a \`children\` array create collapsible group sections:

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'

  const items = [
    { text: 'Fruits', children: [
        { text: 'Apple', value: 'apple' },
        { text: 'Banana', value: 'banana' }
    ]},
    { text: 'Vegetables', children: [
        { text: 'Carrot', value: 'carrot' }
    ]}
  ]
  let value = $state(null)
  let expanded = $state({})
</script>
<List {items} bind:value bind:expanded collapsible />
\`\`\`

## Multi-Selection

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'
  let items = [{ text: 'A', value: 1 }, { text: 'B', value: 2 }]
  let selected = $state([])
</script>
<List {items} bind:selected multiselect />
<p>Selected: {selected.join(', ')}</p>
\`\`\`

## Callbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| \`onselect\` | \`(value, item) => void\` | Item selected |
| \`onselectedchange\` | \`(selected[]) => void\` | Multi-selection changed |
| \`onexpandedchange\` | \`(expanded) => void\` | Group expanded/collapsed |

## Snippets

### Custom Item Rendering

\`\`\`svelte
<List {items}>
  {#snippet item(data, fields, handlers, isActive)}
    <button onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
      {#if data.icon}<span class={data.icon}></span>{/if}
      <span>{data.text}</span>
      {#if data.badge}<span class="badge">{data.badge}</span>{/if}
    </button>
  {/snippet}
</List>
\`\`\`

### Custom Group Label

\`\`\`svelte
<List {items} collapsible>
  {#snippet groupLabel(group, fields, toggle, isExpanded)}
    <button onclick={toggle}>
      <span class={isExpanded ? 'i-lucide:chevron-down' : 'i-lucide:chevron-right'}></span>
      {group.text}
    </button>
  {/snippet}
</List>
\`\`\`

## State Icons

Override the default expand/collapse arrow icons:

\`\`\`svelte
<List {items} collapsible icons={{ opened: 'i-lucide:folder-open', closed: 'i-lucide:folder' }} />
\`\`\`

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`ArrowUp/Down\` | Move focus |
| \`ArrowRight\` | Expand collapsed group |
| \`ArrowLeft\` | Collapse expanded group |
| \`Home/End\` | First/last item |
| \`Enter/Space\` | Select focused item |
| \`Ctrl+Space\` | Toggle multi-selection |

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| \`data-list\` | Root element |
| \`data-list-item\` | Individual item |
| \`data-list-group\` | Group container |
| \`data-list-group-label\` | Group header |
| \`data-selected\` | Selected item |
| \`data-active\` | Active/current item |
| \`data-disabled\` | Disabled item |

## Import

\`\`\`javascript
import { List } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface ListProps {
  items?: ListItem[]
  fields?: ListFields
  value?: unknown
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  collapsible?: boolean
  multiselect?: boolean
  expanded?: Record<string, boolean>
  selected?: unknown[]
  active?: unknown
  icons?: ListStateIcons
  class?: string
  onselect?: (value: unknown, item: ListItem) => void
  onselectedchange?: (selected: unknown[]) => void
  onexpandedchange?: (expanded: Record<string, boolean>) => void
  item?: Snippet<[ListItem, ListFields, ListItemHandlers, boolean]>
  groupLabel?: Snippet<[ListItem, ListFields, () => void, boolean]>
}

interface ListFields {
  value?: string       // default: 'value'
  text?: string        // default: 'text'
  href?: string        // default: 'href'
  icon?: string        // default: 'icon'
  description?: string // default: 'description'
  label?: string       // default: 'label'
  disabled?: string    // default: 'disabled'
  children?: string    // default: 'children'
  snippet?: string     // default: 'snippet'
  badge?: string       // default: 'badge'
}

interface ListStateIcons {
  opened?: string  // icon class for expanded state
  closed?: string  // icon class for collapsed state
}
\`\`\`

## Related Components

- [Tree](/docs/components/tree/llms.txt) — hierarchical tree with per-node expand/collapse
- [Select](/docs/components/select/llms.txt) — dropdown single selection
- [MultiSelect](/docs/components/multiselect/llms.txt) — dropdown multi-selection
- [Tabs](/docs/components/tabs/llms.txt) — tabbed interface
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
