export const lazyTreeDocs = `## Tree with on-demand child fetching

LazyTree mirrors Tree's data model (\`items\`, \`fields\`, snippet
hooks) but lets nodes declare \`children: true\` instead of providing
the children eagerly. The first time the user expands such a node,
\`onlazyload\` fires, and the resolved array becomes the node's
children — with a built-in spinner while the promise pends.

## Basic example

\`\`\`svelte
<script>
  import { LazyTree } from '@rokkit/ui'

  const items = [
    { label: 'Documents', value: 'docs', icon: 'i-glyph:folder', children: true },
    { label: 'Pictures',  value: 'pics', icon: 'i-glyph:folder', children: true },
    { label: 'notes.txt', value: 'notes', icon: 'i-glyph:file-text' }
  ]

  async function handleLazyLoad(item) {
    await new Promise((r) => setTimeout(r, 800))
    if (item.value === 'docs') return [
      { label: 'Resume.pdf', value: 'resume', icon: 'i-glyph:file-text' }
    ]
    if (item.value === 'pics') return [
      { label: 'vacation.jpg', value: 'vacation', icon: 'i-glyph:gallery' }
    ]
    return []
  }

  let value = $state(null)
</script>

<LazyTree {items} onlazyload={handleLazyLoad} bind:value />
\`\`\`

## When to use LazyTree vs Tree

- Use \`Tree\` when the full hierarchy is in memory — small filesystems,
  static menus, taxonomies you ship with the bundle.
- Use \`LazyTree\` when children come from a paginated API, a deep
  filesystem, or a database query — anything where loading the full
  tree upfront would be wasteful or too slow.

Once a node has been expanded, its children are kept around — collapse
+ re-expand doesn't re-fire \`onlazyload\`. To force a refresh, mutate
the item's children array to \`true\` again.

## Loading + empty states

While \`onlazyload\` is in flight, the affected node shows a built-in
spinner. If it resolves to \`[]\`, the node renders an empty-children
placeholder instead of staying in the loading state.

## Custom item content

Same snippet API as Tree — pass \`itemContent\` (or per-item
\`item.snippet = 'name'\` overrides) to replace the default
icon + label + badge layout.
`
