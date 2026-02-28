import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit LazyTree Component

> Tree with on-demand lazy-loaded children and optional root-level pagination.

LazyTree extends Tree with async child loading. Nodes with \`children: true\` (a boolean sentinel) fetch their children via \`onlazyload\` when expanded. A loading spinner appears during fetch. Set \`hasMore\` to show a "Load More" button for root-level pagination.

## Quick Start

\`\`\`svelte
<script>
  import { LazyTree } from '@rokkit/ui'

  const items = [
    { text: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
    { text: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
    { text: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
  ]

  async function loadChildren(item) {
    const res = await fetch(\`/api/tree/\${item.value}\`)
    return res.json()
  }

  let value = $state(null)
</script>

<LazyTree {items} onlazyload={loadChildren} bind:value />
\`\`\`

## How it Works

1. Set \`children: true\` on nodes that should load children on demand
2. Provide \`onlazyload\` — an async function that receives the node's raw item and returns child items
3. When the user expands the node, a loading spinner appears while children are fetched
4. Returned children can themselves have \`children: true\` for progressive lazy loading
5. Once loaded, children are cached — subsequent expand/collapse uses the cached data

## Root-Level Pagination (Load More)

Set \`hasMore={true}\` to show a "Load More" button at the bottom of the tree. When clicked, \`onlazyload()\` is called with no arguments. The callback should return the next batch of root items. Set \`hasMore={false}\` when all items are loaded.

\`\`\`svelte
<script>
  import { LazyTree } from '@rokkit/ui'

  let items = $state([
    { text: 'Item 1', value: '1' },
    { text: 'Item 2', value: '2' }
  ])
  let hasMore = $state(true)

  async function handleLazyLoad(item) {
    if (!item) {
      // No item = "Load More" at root level
      hasMore = false
      return [{ text: 'Item 3', value: '3' }]
    }
    // item provided = lazy-load children for that node
    return fetchChildren(item)
  }
</script>

<LazyTree {items} onlazyload={handleLazyLoad} {hasMore} />
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
| \`onlazyload\` | \`(item?) => Promise<unknown[]>\` | — | Async callback to fetch children (with item) or next root batch (without args) |
| \`hasMore\` | \`boolean\` | \`false\` | Show "Load More" button for root pagination |
| \`class\` | \`string\` | \`''\` | Additional CSS classes |

## Sentinel Pattern

\`\`\`javascript
// children: true  → lazy (will call onlazyload on expand)
// children: [...]  → pre-loaded children
// no children key → leaf node
const items = [
  { text: 'Lazy folder', value: 'lazy', children: true },
  { text: 'Pre-loaded',  value: 'pre',  children: [{ text: 'Child', value: 'c1' }] },
  { text: 'Leaf file',   value: 'leaf' }
]
\`\`\`

## Loading States

During async fetch:
- Node gets \`data-tree-loading\` attribute
- Node gets \`aria-busy="true"\`
- Toggle button shows a spinner (\`data-tree-spinner\`) instead of the expand icon

## Keyboard Navigation

Same as Tree:
| Key | Action |
|-----|--------|
| \`ArrowUp/Down\` | Move between visible nodes |
| \`ArrowRight\` | Expand node (triggers lazy load if needed) |
| \`ArrowLeft\` | Collapse node / go to parent |
| \`Home/End\` | First/last visible node |
| \`Enter/Space\` | Select focused node |

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| \`data-tree\` | Root element |
| \`data-tree-node\` | Tree node |
| \`data-tree-loading\` | Node currently loading children |
| \`data-tree-spinner\` | Loading spinner element |
| \`data-tree-toggle-btn\` | Expand/collapse button |
| \`data-tree-item-content\` | Clickable item content |
| \`data-tree-load-more\` | "Load More" button |
| \`data-active\` | Active/current node |

## Import

\`\`\`javascript
import { LazyTree } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface LazyTreeProps {
  items?: unknown[]
  fields?: Record<string, string>
  value?: unknown
  size?: 'sm' | 'md' | 'lg'
  showLines?: boolean
  icons?: { opened?: string; closed?: string }
  onselect?: (value: unknown, proxy: ProxyItem) => void
  onlazyload?: (item?: unknown) => Promise<unknown[]>
  hasMore?: boolean
  class?: string
}
\`\`\`

## Related Components

- [Tree](/docs/components/tree/llms.txt) — tree without lazy loading
- [List](/docs/components/list/llms.txt) — flat list with collapsible groups
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
