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
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_list',
		description:
			'Mount a List on the canvas, optionally with collapsible groups. Use for shallow 1–2 level grouping where the items are the focus (settings menus, sidebar nav, command palettes). For deeper hierarchy prefer Tree.',
		parameters: {
			items: 'Array of items; group items have a `children` array',
			collapsible: 'boolean — enable expand/collapse on group headers',
			fields: 'optional { label, value } field mapping'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'flat', label: 'Flat list (no groups)', mode: 'dynamic' },
		{ id: 'snippets', label: 'Custom item snippets', mode: 'dynamic' }
	],
	props: {
		size: {
			type: 'enum',
			options: ['sm', 'md', 'lg'],
			default: 'md',
			desc: 'Row density'
		}
	}
}

export default meta
