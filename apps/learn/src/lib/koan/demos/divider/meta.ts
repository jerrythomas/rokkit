import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'divider',
	title: 'Divider',
	description: 'Visual separator between content sections — horizontal or vertical, with optional centred label.',
	keywords: ['divider', 'separator', 'rule', 'line', 'hr', 'split'],
	category: 'feedback',
	icon: '線',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_divider',
		description: 'Mount a Divider gallery — plain horizontal, labelled, vertical.',
		parameters: { orientation: 'horizontal | vertical', label: 'optional centred text' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", desc: 'Direction of the divider' },
			{ name: 'label', type: 'string', desc: 'Optional centred label text' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		attrs: [
			{ selector: '[data-divider]', desc: 'Root element (carries data-orientation)' },
			{ selector: '[data-divider-label]', desc: 'Label span when label is set' }
		]
	},
	snippets: [
		{ id: 'plain', title: 'Plain horizontal', lang: 'svelte', code: `<Divider />` },
		{ id: 'labelled', title: 'With label', lang: 'svelte', code: `<Divider label="OR" />` },
		{ id: 'vertical', title: 'Vertical (inside a flex row)', lang: 'svelte',
			code: `<div style="display: flex; gap: 12px; height: 32px;">\n  <span>Left</span>\n  <Divider orientation="vertical" />\n  <span>Right</span>\n</div>`}
	],
	docs
}

export default meta
