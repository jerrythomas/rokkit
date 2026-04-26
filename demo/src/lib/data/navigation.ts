import type { NavItem, NavGroup } from '$lib/types'

export const mainNav: NavItem[] = [
	{ id: 'observatory', kanji: '観', label: 'Today',        href: '/observatory' },
	{ id: 'sessions',    kanji: '録', label: 'Sessions',     href: '/sessions' },
	{ id: 'patterns',    kanji: '型', label: 'Patterns',     href: '/patterns' },
	{ id: 'libraries',   kanji: '書', label: 'Libraries',    href: '/libraries' },
	{ id: 'instruments', kanji: '具', label: 'Instruments',  href: '/instruments' },
	{ id: 'teachings',   kanji: '教', label: 'Teachings',    href: '/teachings' }
]

export const projectGroups: NavGroup[] = [
	{
		label: 'Active projects',
		items: [
			{ id: 'lumen-studio', kanji: '画', label: 'Lumen Studio', href: '/projects/lumen-studio', badge: '82%' },
			{ id: 'lumen-cloud',  kanji: '雲', label: 'Lumen Cloud',  href: '/projects/lumen-cloud',  badge: '64%' },
			{ id: 'brand-kit',    kanji: '彩', label: 'Brand Kit',    href: '/projects/brand-kit',    badge: '91%' }
		]
	},
	{
		label: 'Recent',
		collapsed: true,
		items: [
			{ id: 'lumen-docs',   kanji: '文', label: 'Lumen Docs',   href: '/projects/lumen-docs' },
			{ id: 'lumen-infra',  kanji: '基', label: 'Infra',        href: '/projects/lumen-infra' }
		]
	}
]

export const settingsNav: NavItem = {
	id: 'settings', kanji: '設', label: 'Settings', href: '/settings'
}
