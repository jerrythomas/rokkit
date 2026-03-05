<script>
	// @ts-nocheck
	import { page } from '$app/state'
	import { List } from '@rokkit/ui'

	let { children } = $props()

	const components = [
		{ title: 'Button', slug: '/playground/components/button', icon: 'i-component:button' },
		{ title: 'Breadcrumbs', slug: '/playground/components/breadcrumbs', icon: 'i-component:breadcrumbs' },
		{ title: 'Card', slug: '/playground/components/card', icon: 'i-component:card' },
		{ title: 'Carousel', slug: '/playground/components/carousel', icon: 'i-component:carousel' },
		{ title: 'Code', slug: '/playground/components/code', icon: 'i-component:code' },
		{ title: 'Floating Action', slug: '/playground/components/floating-action', icon: 'i-component:floating-action' },
		{ title: 'Floating Navigation', slug: '/playground/components/floating-navigation', icon: 'i-component:floating-navigation' },
		{ title: 'Forms', slug: '/playground/components/forms', icon: 'i-component:forms' },
		{ title: 'Lazy Tree', slug: '/playground/components/lazy-tree', icon: 'i-component:lazy-tree' },
		{ title: 'List', slug: '/playground/components/list', icon: 'i-component:list' },
		{ title: 'Menu', slug: '/playground/components/menu', icon: 'i-component:menu' },
		{ title: 'Multi Select', slug: '/playground/components/multi-select', icon: 'i-component:multi-select' },
		{ title: 'Palette Manager', slug: '/playground/components/palette-manager', icon: 'i-component:palette-manager' },
		{ title: 'Pill', slug: '/playground/components/pill', icon: 'i-component:pill' },
		{ title: 'Progress', slug: '/playground/components/progress', icon: 'i-component:progress' },
		{ title: 'Range', slug: '/playground/components/range', icon: 'i-component:range' },
		{ title: 'Rating', slug: '/playground/components/rating', icon: 'i-component:rating' },
		{ title: 'Select', slug: '/playground/components/select', icon: 'i-component:select' },
		{ title: 'Stepper', slug: '/playground/components/stepper', icon: 'i-component:stepper' },
		{ title: 'Switch', slug: '/playground/components/switch', icon: 'i-component:switch' },
		{ title: 'Table', slug: '/playground/components/table', icon: 'i-component:table' },
		{ title: 'Tabs', slug: '/playground/components/tabs', icon: 'i-component:tabs' },
		{ title: 'Timeline', slug: '/playground/components/timeline', icon: 'i-component:timeline' },
		{ title: 'Toggle', slug: '/playground/components/toggle', icon: 'i-component:toggle' },
		{ title: 'Tree', slug: '/playground/components/tree', icon: 'i-component:tree' },
		{ title: 'Upload Progress', slug: '/playground/components/upload-progress', icon: 'i-component:upload-progress' },
		{ title: 'Upload Target', slug: '/playground/components/upload-target', icon: 'i-component:upload-target' }
	]

	const sections = [
		{
			title: 'Components',
			children: components
		}
	]

	const fields = { text: 'title', href: 'slug', icon: 'icon', value: 'slug' }
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<header class="bg-surface-z2 border-surface-z2 text-surface-z7 border-b px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-semibold">Component Playground</h1>
				<p class="text-sm text-surface-z5">Interactive testing environment for Rokkit components</p>
			</div>
			<a href="/playground" class="text-sm text-surface-z5 hover:text-surface-z7">← Back to Overview</a>
		</div>
	</header>

	<div class="flex flex-1 min-h-0 overflow-hidden">
		<aside class="w-64 flex-shrink-0 border-r border-surface-z2 bg-surface-z1 overflow-y-auto">
			<div class="p-3">
				<h3 class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-surface-z5 m-0">
					Components
				</h3>
				<List items={sections} {fields} value={page.url.pathname} collapsible />
			</div>
		</aside>

		<main data-playground-content class="bg-surface-z1 text-surface-z8 flex flex-col overflow-auto flex-1 min-w-0">
			{@render children()}
		</main>
	</div>
</div>
