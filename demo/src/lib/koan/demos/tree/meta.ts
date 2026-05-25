import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'tree',
	title: 'Tree Select',
	description:
		'Hierarchical nested items with expand/collapse, keyboard navigation, and selection. Data-driven via children + field mapping.',
	keywords: [
		'tree', 'trees', 'hierarchy', 'hierarchical', 'nested', 'select',
		'folder', 'folders', 'files', 'navigation', 'nav', 'directory',
		'outline', 'parent', 'child', 'children'
	],
	category: 'navigation',
	icon: '枝',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_tree',
		description:
			'Mount a hierarchical Tree on the canvas. Use for multi-level nested data — file systems, org charts, navigation outlines, parent/child relationships.',
		parameters: {
			items: 'Array of nodes with optional `children` arrays',
			fields: 'optional { label, value } field mapping',
			value: 'optional initially-selected node id'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'async', label: 'Async-loaded children', mode: 'dynamic' },
		{ id: 'multi-select', label: 'Multi-select', mode: 'dynamic' }
	]
}

export default meta
