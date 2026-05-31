import type { DemoMeta } from '../../types'
import { lazyTreeDocs } from './docs'

const meta: DemoMeta = {
	id: 'lazy-tree',
	title: 'LazyTree',
	description: 'Tree with on-demand child fetching — declare `children: true`, resolve via `onlazyload`.',
	keywords: [
		'lazy-tree', 'async-tree', 'on-demand', 'paginated-tree',
		'file-tree', 'directory-tree', 'deep-tree', 'lazy'
	],
	category: 'data',
	icon: '枝',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_lazy_tree',
		description: 'Mount a LazyTree on the canvas.',
		parameters: { items: 'array of nodes', onlazyload: 'async fetcher' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'unknown[]', default: '[]', desc: 'Node objects; use `children: true` for nodes that should fetch on expand' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'unknown', desc: 'Selected value', bindable: true },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Size variant' },
			{ name: 'lineStyle', type: "'none' | 'solid' | 'dashed' | 'dotted'", default: "'solid'", desc: 'Indent guide line style' },
			{ name: 'icons', type: '{ opened?: string; closed?: string }', desc: 'Override folder open/closed icons' },
			{ name: 'labels', type: 'Record<string, string>', desc: 'Localized labels (root role label etc.)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onselect', signature: '(value, proxy) => void', desc: 'Fires when a leaf or node is activated' },
			{ name: 'onlazyload', signature: '(item) => Promise<unknown[]>', desc: 'Resolve a node\'s children on first expand' }
		],
		attrs: [
			{ selector: '[data-tree]', desc: 'Root container (carries data-size, data-line-style)' },
			{ selector: '[data-tree-item]', desc: 'Each row (carries data-active, data-expanded, data-loading)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — async folder children',
			lang: 'svelte',
			code: `<script>
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
    return []
  }
</script>

<LazyTree {items} onlazyload={handleLazyLoad} />`
		},
		{
			id: 'nested',
			title: 'Nested lazy — second-level fetch',
			lang: 'svelte',
			code: `async function handleLazyLoad(item) {
  if (item.value === 'projects') return [
    { label: 'rokkit', value: 'rokkit', icon: 'i-glyph:folder', children: true }
  ]
  if (item.value === 'rokkit') return [
    { label: 'README.md', value: 'readme', icon: 'i-glyph:file-text' }
  ]
}`
		}
	],
	docs: lazyTreeDocs
}

export default meta
