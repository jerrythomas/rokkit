import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Tree Component

> Hierarchical data navigation with tree lines and keyboard navigation.

The Tree component renders nested items with tree-line connectors, expand/collapse per node, and keyboard navigation. Built on the Wrapper + Navigator pattern (same architecture as List).

## Quick Start

\`\`\`svelte
<script>
  import { Tree } from '@rokkit/ui'

  const items = [
    {
      text: 'src',
      value: 'src',
      icon: 'i-lucide:folder',
      children: [
        { text: 'index.ts', value: 'index', icon: 'i-lucide:file-code' },
        { text: 'utils.ts', value: 'utils', icon: 'i-lucide:file-code' }
      ]
    },
    { text: 'README.md', value: 'readme', icon: 'i-lucide:file-text' }
  ]

  let value = $state(null)
</script>

<Tree {items} bind:value onselect={(v) => (value = v)} />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`unknown[]\` | \`[]\` | Hierarchical data array |
| \`fields\` | \`Record<string, string>\` | \`{}\` | Field mapping |
| \`value\` | \`unknown\` | — | Selected value |
| \`size\` | \`'sm'\\|'md'\\|'lg'\` | \`'md'\` | Size variant |
| \`showLines\` | \`boolean\` | \`true\` | Show tree line connectors |
| \`icons\` | \`{ opened?: string; closed?: string }\` | defaults | Override expand/collapse icons |
| \`onselect\` | \`(value, proxy) => void\` | — | Selection callback |
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

## Custom Field Mapping

\`\`\`svelte
<Tree {items} fields={{ text: 'name', value: 'id' }} />
\`\`\`

## Custom Icons

\`\`\`svelte
<Tree {items} icons={{ opened: 'i-lucide:folder-open', closed: 'i-lucide:folder' }} />
\`\`\`

## Snippets

### Custom Item Rendering

\`\`\`svelte
<Tree {items}>
  {#snippet itemContent(proxy)}
    {#if proxy.icon}
      <span class={proxy.icon} aria-hidden="true"></span>
    {/if}
    <span class="flex-1">{proxy.text}</span>
    {#if proxy.get('badge')}
      <span class="badge">{proxy.get('badge')}</span>
    {/if}
  {/snippet}
</Tree>
\`\`\`

## ProxyItem API

Snippets receive a \`ProxyItem\` instance:

| Property | Description |
|----------|-------------|
| \`proxy.text\` | Mapped display text |
| \`proxy.icon\` | Mapped icon class |
| \`proxy.value\` | The original raw item |
| \`proxy.href\` | Mapped href (renders as \`<a>\`) |
| \`proxy.disabled\` | Whether the item is disabled |
| \`proxy.expanded\` | Expand state for branch nodes |
| \`proxy.hasChildren\` | Whether the node has children |
| \`proxy.get('field')\` | Read any field by name |

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
| \`data-tree-node\` | Tree node |
| \`data-tree-node-row\` | Node content row |
| \`data-tree-toggle-btn\` | Expand/collapse button |
| \`data-tree-item-content\` | Clickable item content |
| \`data-tree-path\` | Node path key |
| \`data-tree-level\` | Node depth level |
| \`data-tree-has-children\` | Branch node marker |
| \`data-active\` | Active/current node |
| \`data-show-lines\` | Root: tree lines enabled |
| \`data-size\` | Root: size variant |

## Import

\`\`\`javascript
import { Tree } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface TreeProps {
  items?: unknown[]
  fields?: Record<string, string>
  value?: unknown
  size?: 'sm' | 'md' | 'lg'
  showLines?: boolean
  icons?: { opened?: string; closed?: string }
  onselect?: (value: unknown, proxy: ProxyItem) => void
  class?: string
}
\`\`\`

## Related Components

- [List](/docs/components/list/llms.txt) — flat list with collapsible groups
- [LazyTree](/docs/components/lazy-tree/llms.txt) — tree with lazy-loaded children
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
