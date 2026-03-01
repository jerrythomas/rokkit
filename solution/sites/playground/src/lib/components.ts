export type ComponentEntry = {
	text: string
	href: string
	icon: string
}

export type ComponentGroup = {
	text: string
	icon: string
	expanded: boolean
	children: ComponentEntry[]
}

export const componentGroups: ComponentGroup[] = [
	{
		text: 'Actions',
		icon: 'i-lucide:mouse-pointer-click',
		expanded: true,
		children: [
			{ text: 'Button', href: '/components/button', icon: 'i-lucide:square' },
			{ text: 'FloatingAction', href: '/components/floating-action', icon: 'i-lucide:plus' },
			{ text: 'FloatingNavigation', href: '/components/floating-navigation', icon: 'i-lucide:compass' }
		]
	},
	{
		text: 'Selection',
		icon: 'i-lucide:toggle-left',
		expanded: true,
		children: [
			{ text: 'Toggle', href: '/components/toggle', icon: 'i-lucide:circle' },
			{ text: 'Select', href: '/components/select', icon: 'i-lucide:chevron-down' },
			{ text: 'MultiSelect', href: '/components/multi-select', icon: 'i-lucide:list-checks' },
			{ text: 'Menu', href: '/components/menu', icon: 'i-lucide:menu' },
			{ text: 'Range', href: '/components/range', icon: 'i-lucide:sliders-horizontal' },
			{ text: 'Switch', href: '/components/switch', icon: 'i-lucide:toggle-right' }
		]
	},
	{
		text: 'Navigation',
		icon: 'i-lucide:navigation',
		expanded: true,
		children: [
			{ text: 'List', href: '/components/list', icon: 'i-lucide:list' },
			{ text: 'Tree', href: '/components/tree', icon: 'i-lucide:folder' },
			{ text: 'LazyTree', href: '/components/lazy-tree', icon: 'i-lucide:folder-sync' },
			{ text: 'Tabs', href: '/components/tabs', icon: 'i-lucide:panel-top' },
			{ text: 'Toolbar', href: '/components/toolbar', icon: 'i-lucide:grid-2x2' },
			{ text: 'BreadCrumbs', href: '/components/breadcrumbs', icon: 'i-lucide:navigation' }
		]
	},
	{
		text: 'Display',
		icon: 'i-lucide:layout-grid',
		expanded: true,
		children: [
			{ text: 'Table', href: '/components/table', icon: 'i-lucide:table-2' },
			{ text: 'Card', href: '/components/card', icon: 'i-lucide:square' },
			{ text: 'Carousel', href: '/components/carousel', icon: 'i-lucide:gallery-horizontal' },
			{ text: 'Timeline', href: '/components/timeline', icon: 'i-lucide:milestone' },
			{ text: 'Code', href: '/components/code', icon: 'i-lucide:file-code' },
			{ text: 'Pill', href: '/components/pill', icon: 'i-lucide:tag' }
		]
	},
	{
		text: 'Feedback',
		icon: 'i-lucide:activity',
		expanded: true,
		children: [
			{ text: 'ProgressBar', href: '/components/progress', icon: 'i-lucide:loader' },
			{ text: 'Rating', href: '/components/rating', icon: 'i-lucide:star' },
			{ text: 'Stepper', href: '/components/stepper', icon: 'i-lucide:git-commit-horizontal' }
		]
	},
	{
		text: 'Effects',
		icon: 'i-lucide:sparkles',
		expanded: true,
		children: [
			{ text: 'Tilt', href: '/components/tilt', icon: 'i-lucide:rotate-3d' },
			{ text: 'Shine', href: '/components/shine', icon: 'i-lucide:sparkles' },
			{ text: 'Reveal', href: '/components/reveal', icon: 'i-lucide:eye' }
		]
	},
	{
		text: 'Forms',
		icon: 'i-lucide:file-text',
		expanded: true,
		children: [
			{ text: 'FormRenderer', href: '/components/forms', icon: 'i-lucide:file-text' },
			{ text: 'PaletteManager', href: '/components/palette-manager', icon: 'i-lucide:palette' }
		]
	}
]

// Flat list for the home page grid
export const components = componentGroups.flatMap((g) => g.children)

export const themes = ['rokkit', 'minimal', 'material', 'glass'] as const
export type Theme = (typeof themes)[number]
