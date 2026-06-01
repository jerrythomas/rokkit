import type { DemoMeta } from '../../types'
import { stackDocs } from './docs'

const meta: DemoMeta = {
	id: 'stack',
	title: 'Stack',
	description: 'Flex layout primitive — vertical or horizontal stack with a constrained gap scale.',
	keywords: ['stack', 'flex', 'layout', 'spacing', 'vbox', 'hbox', 'column', 'row'],
	category: 'layout',
	icon: '層',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_stack',
		description: 'Mount a Stack layout demo on the canvas.',
		parameters: { direction: 'vertical | horizontal', gap: 'none|xs|sm|md|lg|xl' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", desc: 'Flex direction' },
			{ name: 'gap', type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", desc: 'Spacing between children — pulls from the active style scale' },
			{ name: 'align', type: "'start' | 'center' | 'end' | 'stretch'", desc: 'Cross-axis alignment' },
			{ name: 'justify', type: "'start' | 'center' | 'end' | 'between' | 'around'", desc: 'Main-axis justification' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [],
		attrs: [
			{ selector: '[data-stack]', desc: 'Root container (carries data-direction, data-gap, data-align, data-justify)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Vertical stack',
			lang: 'svelte',
			code: `<Stack gap="sm">
  <div data-card>Item one</div>
  <div data-card>Item two</div>
  <div data-card>Item three</div>
</Stack>`
		},
		{
			id: 'horizontal',
			title: 'Horizontal stack',
			lang: 'svelte',
			code: `<Stack direction="horizontal" gap="md" align="center">
  <span class="i-mdi:home" aria-hidden="true"></span>
  <span>Home</span>
</Stack>`
		},
		{
			id: 'alignment',
			title: 'Justify between',
			lang: 'svelte',
			code: `<Stack direction="horizontal" justify="between">
  <h2>Title</h2>
  <button>Action</button>
</Stack>`
		}
	],
	docs: stackDocs
}

export default meta
