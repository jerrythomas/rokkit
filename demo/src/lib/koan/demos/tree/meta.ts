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
	load: () => import('./placeholder.svelte')
}

export default meta
