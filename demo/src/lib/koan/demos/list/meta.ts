import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'list',
	title: 'List with Groups',
	description:
		'Vertical list with collapsible groups (1–2 level shallow grouping). The right choice when groups are headings, not the focus.',
	keywords: [
		'list', 'lists', 'menu', 'sidebar', 'rail',
		'group', 'groups', 'collapsible', 'collapse',
		'expand', 'section', 'sections', 'category', 'categories'
	],
	category: 'navigation',
	icon: '列',
	load: () => import('./placeholder.svelte')
}

export default meta
