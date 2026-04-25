import type { NavItem, NavGroup } from '$lib/types'

export const mainNav: NavItem[] = [
	{ id: 'observatory', kanji: '観', label: 'Today',        href: '/observatory' },
	{ id: 'sessions',    kanji: '録', label: 'Sessions',     href: '/sessions' },
	{ id: 'patterns',    kanji: '型', label: 'Patterns',     href: '/observatory' },
	{ id: 'libraries',   kanji: '書', label: 'Libraries',    href: '/observatory' },
	{ id: 'instruments', kanji: '具', label: 'Instruments',  href: '/observatory' },
	{ id: 'teachings',   kanji: '教', label: 'Teachings',    href: '/observatory' }
]

export const projectGroups: NavGroup[] = [
	{
		label: 'Active projects',
		items: [
			{ id: 'lumen-studio', kanji: '画', label: 'Lumen Studio', href: '/observatory', badge: '82%' },
			{ id: 'lumen-cloud',  kanji: '雲', label: 'Lumen Cloud',  href: '/observatory', badge: '64%' },
			{ id: 'brand-kit',    kanji: '彩', label: 'Brand Kit',    href: '/observatory', badge: '91%' }
		]
	},
	{
		label: 'Recent',
		collapsed: true,
		items: [
			{ id: 'lumen-docs',   kanji: '文', label: 'Lumen Docs',   href: '/observatory' },
			{ id: 'lumen-infra',  kanji: '基', label: 'Infra',        href: '/observatory' }
		]
	}
]

export const settingsNav: NavItem = {
	id: 'settings', kanji: '設', label: 'Settings', href: '/settings'
}
