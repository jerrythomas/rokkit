export const components = [
	{ text: 'Button', href: '/components/button', icon: 'i-lucide:square' },
	{ text: 'Menu', href: '/components/menu', icon: 'i-lucide:menu' },
	{ text: 'Select', href: '/components/select', icon: 'i-lucide:chevron-down' },
	{ text: 'MultiSelect', href: '/components/multi-select', icon: 'i-lucide:list' },
	{ text: 'List', href: '/components/list', icon: 'i-lucide:list' },
	{ text: 'Tree', href: '/components/tree', icon: 'i-lucide:folder' },
	{ text: 'Tabs', href: '/components/tabs', icon: 'i-lucide:panel-top' },
	{ text: 'Toggle', href: '/components/toggle', icon: 'i-lucide:circle' },
	{ text: 'Toolbar', href: '/components/toolbar', icon: 'i-lucide:grid-2x2' },
	{ text: 'FloatingAction', href: '/components/floating-action', icon: 'i-lucide:plus' },
	{ text: 'FloatingNavigation', href: '/components/floating-navigation', icon: 'i-lucide:compass' },
	{ text: 'Code', href: '/components/code', icon: 'i-lucide:file-code' },
	{ text: 'PaletteManager', href: '/components/palette-manager', icon: 'i-lucide:palette' },
	{ text: 'Tilt', href: '/components/tilt', icon: 'i-lucide:rotate-3d' },
	{ text: 'Shine', href: '/components/shine', icon: 'i-lucide:sparkles' },
	{ text: 'BreadCrumbs', href: '/components/breadcrumbs', icon: 'i-lucide:navigation' },
	{ text: 'Card', href: '/components/card', icon: 'i-lucide:square' },
	{ text: 'ProgressBar', href: '/components/progress', icon: 'i-lucide:loader' },
	{ text: 'Carousel', href: '/components/carousel', icon: 'i-lucide:gallery-horizontal' },
	{ text: 'Pill', href: '/components/pill', icon: 'i-lucide:tag' },
	{ text: 'Rating', href: '/components/rating', icon: 'i-lucide:star' },
	{ text: 'Stepper', href: '/components/stepper', icon: 'i-lucide:git-commit-horizontal' },
	{ text: 'Reveal', href: '/components/reveal', icon: 'i-lucide:eye' },
	{ text: 'FormRenderer', href: '/components/forms', icon: 'i-lucide:file-text' }
] as const

export const themes = ['rokkit', 'minimal', 'material', 'glass'] as const
export type Theme = (typeof themes)[number]
