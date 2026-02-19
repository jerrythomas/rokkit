export const components = [
	{ text: 'Menu', href: '/components/menu', icon: 'i-lucide:menu' },
	{ text: 'Select', href: '/components/select', icon: 'i-lucide:chevron-down' },
	{ text: 'MultiSelect', href: '/components/multi-select', icon: 'i-lucide:list' },
	{ text: 'List', href: '/components/list', icon: 'i-lucide:list' },
	{ text: 'Tree', href: '/components/tree', icon: 'i-lucide:folder' },
	{ text: 'Toggle', href: '/components/toggle', icon: 'i-lucide:circle' },
	{ text: 'Toolbar', href: '/components/toolbar', icon: 'i-lucide:grid-2x2' },
	{ text: 'FloatingAction', href: '/components/floating-action', icon: 'i-lucide:plus' },
	{ text: 'Code', href: '/components/code', icon: 'i-lucide:file-code' },
	{ text: 'PaletteManager', href: '/components/palette-manager', icon: 'i-lucide:palette' }
] as const

export const themes = ['shingoki', 'rokkit', 'minimal', 'material', 'glass'] as const
export type Theme = (typeof themes)[number]
