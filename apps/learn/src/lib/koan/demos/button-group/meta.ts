import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'button-group',
	title: 'ButtonGroup',
	description: 'Visually attached cluster of related buttons — split actions or segmented filters.',
	keywords: [
		'button-group', 'btn-group', 'split-button', 'cluster',
		'related-buttons', 'attached-buttons'
	],
	category: 'navigation',
	icon: '組',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_button_group',
		description: 'Mount a ButtonGroup gallery on the canvas.',
		parameters: { size: 'sm | md | lg' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Size variant — propagates down to child buttons via data-size' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' },
			{ name: 'children', type: 'Snippet', desc: 'Buttons to render inside the group' }
		],
		events: [],
		attrs: [
			{ selector: '[data-button-group]', desc: 'Root container (role="group"; carries data-size)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Split action',
			lang: 'svelte',
			code: `<ButtonGroup>
  <Button>Save</Button>
  <Button>Save as…</Button>
  <Button icon="i-mdi:chevron-down" aria-label="More" />
</ButtonGroup>`
		},
		{
			id: 'segmented',
			title: 'Segmented filter',
			lang: 'svelte',
			code: `<ButtonGroup>
  <Button>All</Button>
  <Button>Active</Button>
  <Button>Archived</Button>
</ButtonGroup>`
		},
		{
			id: 'sizes',
			title: 'Sizes',
			lang: 'svelte',
			code: `<ButtonGroup size="sm">...</ButtonGroup>
<ButtonGroup size="md">...</ButtonGroup>
<ButtonGroup size="lg">...</ButtonGroup>`
		}
	],
	docs
}

export default meta
