import type { NavGroup } from '$lib/types'
import { m } from '$lib/paraglide/messages.js'

// Navigation items use function calls for labels so they react to locale changes
export function getMainNav() {
	return [
		{ id: 'observatory', kanji: '観', label: m.nav_today(),        href: '/observatory' },
		{ id: 'sessions',    kanji: '録', label: m.nav_sessions(),     href: '/sessions' },
		{ id: 'patterns',    kanji: '型', label: m.nav_patterns(),     href: '/patterns' },
		{ id: 'libraries',   kanji: '書', label: m.nav_libraries(),    href: '/libraries' },
		{ id: 'instruments', kanji: '具', label: m.nav_instruments(),  href: '/instruments' },
		{ id: 'teachings',   kanji: '教', label: m.nav_teachings(),    href: '/teachings' }
	]
}

export function getProjectGroups(): NavGroup[] {
	return [
		{
			label: m.nav_active_projects(),
			items: [
				{ id: 'lumen-studio', kanji: '画', label: 'Lumen Studio', href: '/projects/lumen-studio', badge: '82%' },
				{ id: 'lumen-cloud',  kanji: '雲', label: 'Lumen Cloud',  href: '/projects/lumen-cloud',  badge: '64%' },
				{ id: 'brand-kit',    kanji: '彩', label: 'Brand Kit',    href: '/projects/brand-kit',    badge: '91%' }
			]
		},
		{
			label: m.nav_recent(),
			collapsed: true,
			items: [
				{ id: 'lumen-docs',   kanji: '文', label: 'Lumen Docs',   href: '/projects/lumen-docs' },
				{ id: 'lumen-infra',  kanji: '基', label: 'Infra',        href: '/projects/lumen-infra' }
			]
		}
	]
}

export function getSettingsNav() {
	return { id: 'settings', kanji: '設', label: m.nav_settings(), href: '/settings' }
}

export function getSidebarNav() {
	return [
		...getMainNav(),
		...getProjectGroups().map((g) => ({
			id: g.label,
			label: g.label,
			children: g.items
		}))
	]
}
