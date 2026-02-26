import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Tree Component

> Data-driven tree component for hierarchical data with expand/collapse, keyboard navigation, and lazy loading.

The Tree component renders nested items with tree-line connectors, expand/collapse per node, single or multi-selection, and optional lazy child loading via \`onloadchildren\`.

## Quick Start

\`\`\`svelte
<script>
  import { Tree } from '@rokkit/ui'

  let items = $state([
    {
      text: 'Documents',
      value: 'docs',
      children: [
        { text: 'Report.pdf', value: 'report' },
        { text: 'Notes.txt',  value: 'notes' }
      ]
    },
    { text: 'Images', value: 'images', children: [] }
  ])

  let value = $state(null)
</script>

<Tree {items} bind:value />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`TreeItem[]\` | \`[]\` | Hierarchical data array |
| \`fields\` | \`TreeFields\` | defaults | Field mapping |
| \`value\` | \`unknown\` | — | Selected value — use \`bind:value\` |
| \`size\` | \`'sm'|'md'|'lg'\` | \`'md'\` | Size variant |
| \`showLines\` | \`boolean\` | \`true\` | Show tree line connectors |
| \`multiselect\` | \`boolean\` | \`false\` | Enable multi-selection |
| \`expanded\` | \`Record<string,boolean>\` | \`{}\` | Expanded nodes — use \`bind:expanded\` |
| \`selected\` | \`unknown[]\` | \`[]\` | Selected values (multiselect) — use \`bind:selected\` |
| \`expandAll\` | \`boolean\` | \`false\` | Expand all nodes by default |
| \`active\` | \`unknown\` | — | Highlight node by value |
| \`icons\` | \`TreeStateIcons\` | — | Override expand/collapse icons |
| \`class\` | \`string\` | \`''\` | Additional CSS classes |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'value'\` | Unique identifier for selection |
| \`text\` | \`'text'\` | Display text |
| \`icon\` | \`'icon'\` | Icon class name |
| \`description\` | \`'description'\` | Secondary text |
| \`children\` | \`'children'\` | Nested items array |
| \`expanded\` | \`'expanded'\` | Initial expanded state |
| \`disabled\` | \`'disabled'\` | Disabled state |
| \`href\` | \`'href'\` | URL (renders as \`<a>\`) |
| \`badge\` | \`'badge'\` | Badge/count indicator |
| \`level\` | \`'level'\` | Depth override |

## Lazy Loading Children

Set \`children: true\` (not an array) on a node to trigger lazy loading when the user expands it. Provide \`onloadchildren\` to fetch the data:

\`\`\`svelte
<script>
  import { Tree } from '@rokkit/ui'

  let items = $state([
    { text: 'src',  value: 'src',  children: true },   // lazy
    { text: 'docs', value: 'docs', children: [] }       // empty leaf
  ])

  async function loadChildren(value, item) {
    const res = await fetch(\`/api/tree/\${value}\`)
    return res.json()
  }
</script>

<Tree {items} bind:value onloadchildren={loadChildren} />
\`\`\`

## Callbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| \`onselect\` | \`(value, item) => void\` | Node selected |
| \`onselectedchange\` | \`(selected[]) => void\` | Multi-selection changed |
| \`onexpandedchange\` | \`(expanded) => void\` | Expanded state changed |
| \`ontoggle\` | \`(value, item, isExpanded) => void\` | Node toggled |
| \`onloadchildren\` | \`async (value, item) => TreeItem[]\` | Load children lazily |

## Snippets

### Custom Item Rendering

\`\`\`svelte
<Tree {items}>
  {#snippet item(data, fields, handlers, isActive, isExpanded, level)}
    <button onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
      {#if data.icon}<span class={data.icon}></span>{/if}
      <span>{data.text}</span>
      {#if data.badge}<span class="badge">{data.badge}</span>{/if}
    </button>
  {/snippet}
</Tree>
\`\`\`

### Custom Toggle Icon

\`\`\`svelte
<Tree {items}>
  {#snippet toggle(isExpanded, hasChildren, icons)}
    {#if hasChildren}
      <span class={isExpanded ? 'i-lucide:chevron-down' : 'i-lucide:chevron-right'}></span>
    {:else}
      <span class="i-lucide:minus w-4"></span>
    {/if}
  {/snippet}
</Tree>
\`\`\`

## State Icons

Override the default expand/collapse icons:

\`\`\`svelte
<Tree {items} icons={{ opened: 'i-lucide:folder-open', closed: 'i-lucide:folder' }} />
\`\`\`

## Expand All Nodes

\`\`\`svelte
<Tree {items} expandAll bind:value />
\`\`\`

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`ArrowUp/Down\` | Move between visible nodes |
| \`ArrowRight\` | Expand node / enter first child |
| \`ArrowLeft\` | Collapse node / go to parent |
| \`Home/End\` | First/last visible node |
| \`Enter/Space\` | Select focused node |

## Accessibility

- \`role="tree"\` on root
- \`role="treeitem"\` on each node
- \`aria-expanded\` on branch nodes
- \`aria-selected\` on selected nodes
- Full keyboard navigation

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| \`data-tree\` | Root element |
| \`data-tree-item\` | Tree node |
| \`data-tree-toggle\` | Expand/collapse button |
| \`data-expanded\` | Expanded node |
| \`data-selected\` | Selected node |
| \`data-active\` | Active/current node |
| \`data-loading\` | Node loading children |

## Import

\`\`\`javascript
import { Tree } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface TreeProps {
  items?: TreeItem[]
  fields?: TreeFields
  value?: unknown
  size?: 'sm' | 'md' | 'lg'
  showLines?: boolean
  multiselect?: boolean
  expanded?: Record<string, boolean>
  selected?: unknown[]
  expandAll?: boolean
  active?: unknown
  icons?: TreeStateIcons
  class?: string
  onselect?: (value: unknown, item: TreeItem) => void
  onselectedchange?: (selected: unknown[]) => void
  onexpandedchange?: (expanded: Record<string, boolean>) => void
  ontoggle?: (value: unknown, item: TreeItem, isExpanded: boolean) => void
  onloadchildren?: (value: unknown, item: TreeItem) => Promise<TreeItem[]>
  item?: Snippet<[TreeItem, TreeFields, TreeItemHandlers, boolean, boolean, number]>
  toggle?: Snippet<[boolean, boolean, TreeStateIcons]>
  connector?: Snippet<[TreeLineType]>
}

interface TreeFields {
  value?: string       // default: 'value'
  text?: string        // default: 'text'
  icon?: string        // default: 'icon'
  description?: string // default: 'description'
  children?: string    // default: 'children'
  expanded?: string    // default: 'expanded'
  disabled?: string    // default: 'disabled'
  href?: string        // default: 'href'
  badge?: string       // default: 'badge'
  level?: string       // default: 'level'
}

interface TreeStateIcons {
  opened?: string  // icon class for expanded state
  closed?: string  // icon class for collapsed state
}

type TreeLineType = 'child' | 'last' | 'sibling' | 'empty' | 'icon'
\`\`\`

## Related Components

- [List](/docs/components/list/llms.txt) — flat list with collapsible groups
- [Accordion](/docs/components/accordion/llms.txt) — collapsible content panels
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
