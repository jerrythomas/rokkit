import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'breadcrumbs',
	title: 'BreadCrumbs',
	description: 'Hierarchical navigation trail — clickable crumbs with the current page marked at the end.',
	keywords: [
		'breadcrumbs', 'crumbs', 'navigation', 'trail', 'hierarchy',
		'path', 'wayfinding', 'parent-link'
	],
	category: 'navigation',
	icon: '径',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_breadcrumbs',
		description: 'Mount a BreadCrumbs trail on the canvas.',
		parameters: { items: 'array of crumb objects with label/icon/href' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'unknown[]', default: '[]', desc: 'Crumb objects with `label`, optional `icon`, optional `href`' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields (e.g. `title` → `label`)' },
			{ name: 'icons', type: '{ separator?: string }', desc: 'Override the chevron icon between crumbs' },
			{ name: 'label', type: 'string', desc: 'Accessible label for the nav landmark (defaults to a localized "Breadcrumbs")' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onclick', signature: '(value, item) => void', desc: 'Fires when a non-current crumb is clicked' }
		],
		attrs: [
			{ selector: '[data-breadcrumbs]', desc: 'Root nav landmark' },
			{ selector: '[data-breadcrumb-list]', desc: 'Ordered list wrapper' },
			{ selector: '[data-breadcrumb-item]', desc: 'Individual crumb (carries data-current on the last)' },
			{ selector: '[data-breadcrumb-link]', desc: 'Linked crumb (anchor or button)' },
			{ selector: '[data-breadcrumb-current]', desc: 'The final, non-linked crumb (aria-current="page")' },
			{ selector: '[data-breadcrumb-separator]', desc: 'Chevron between crumbs' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — with icons + href',
			lang: 'svelte',
			code: `<script>
  import { BreadCrumbs } from '@rokkit/ui'

  const trail = [
    { label: 'Home', href: '/', icon: 'i-glyph:home' },
    { label: 'Products', href: '/products', icon: 'i-glyph:box' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops' }
  ]
</script>

<BreadCrumbs items={trail} onclick={(v, item) => console.log(item)} />`
		},
		{
			id: 'separator',
			title: 'Custom separator',
			lang: 'svelte',
			code: `<BreadCrumbs
  items={trail}
  icons={{ separator: 'i-mdi:slash-forward' }}
/>`
		},
		{
			id: 'fields',
			title: 'Custom field mapping',
			lang: 'svelte',
			code: `<BreadCrumbs
  items={data}
  fields={{ label: 'title', href: 'path' }}
/>`
		}
	],
	docs
}

export default meta
