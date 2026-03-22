<script>
	// @ts-nocheck
	import { page } from '$app/state'
	import { List } from '@rokkit/ui'

	let { children } = $props()

	const sections = [
		{
			title: 'Navigation & Selection',
			icon: 'i-glyph:list-check',
			children: [
				{
					title: 'Breadcrumbs',
					slug: '/playground/components/breadcrumbs',
					icon: 'i-glyph:breadcrumbs'
				},
				{
					title: 'Lazy Tree',
					slug: '/playground/components/lazy-tree',
					icon: 'i-glyph:lazy-tree'
				},
				{ title: 'List', slug: '/playground/components/list', icon: 'i-glyph:list' },
				{ title: 'Dropdown', slug: '/playground/components/dropdown', icon: 'i-glyph:dropdown' },
				{ title: 'Menu', slug: '/playground/components/menu', icon: 'i-glyph:menu' },
				{
					title: 'Multi Select',
					slug: '/playground/components/multi-select',
					icon: 'i-glyph:multi-select'
				},
				{ title: 'Select', slug: '/playground/components/select', icon: 'i-glyph:select' },
				{ title: 'Tabs', slug: '/playground/components/tabs', icon: 'i-glyph:tabs' },
				{ title: 'Toggle', slug: '/playground/components/toggle', icon: 'i-glyph:toggle' },
				{ title: 'Tree', slug: '/playground/components/tree', icon: 'i-glyph:tree' }
			]
		},
		{
			title: 'Inputs',
			icon: 'i-glyph:keyboard',
			children: [
				{ title: 'Button', slug: '/playground/components/button', icon: 'i-glyph:button' },
				{ title: 'Inputs', slug: '/playground/components/inputs', icon: 'i-glyph:forms' },
				{
					title: 'Button Group',
					slug: '/playground/components/button-group',
					icon: 'i-glyph:button'
				},
				{ title: 'Range', slug: '/playground/components/range', icon: 'i-glyph:range' },
				{ title: 'Rating', slug: '/playground/components/rating', icon: 'i-glyph:rating' },
				{ title: 'Stepper', slug: '/playground/components/stepper', icon: 'i-glyph:stepper' },
				{ title: 'Switch', slug: '/playground/components/switch', icon: 'i-glyph:switch' },
				{
					title: 'Upload Progress',
					slug: '/playground/components/upload-progress',
					icon: 'i-glyph:upload-progress'
				},
				{
					title: 'Upload Target',
					slug: '/playground/components/upload-target',
					icon: 'i-glyph:upload-target'
				}
			]
		},
		{
			title: 'Display',
			icon: 'i-glyph:gallery-wide',
			children: [
				{
					title: 'Alert List',
					slug: '/playground/components/alert-list',
					icon: 'i-glyph:bell'
				},
				{ title: 'Card', slug: '/playground/components/card', icon: 'i-glyph:card' },
				{ title: 'Code', slug: '/playground/components/code', icon: 'i-glyph:code' },
				{ title: 'Forms', slug: '/playground/components/forms', icon: 'i-glyph:forms' },
				{ title: 'Grid', slug: '/playground/components/grid', icon: 'i-glyph:grid' },
				{ title: 'Message', slug: '/playground/components/message', icon: 'i-glyph:message' },
				{ title: 'Pill', slug: '/playground/components/pill', icon: 'i-glyph:pill' },
				{
					title: 'Status List',
					slug: '/playground/components/status-list',
					icon: 'i-glyph:status-list'
				},
				{
					title: 'Search Filter',
					slug: '/playground/components/search-filter',
					icon: 'i-glyph:search-filter'
				},
				{ title: 'Table', slug: '/playground/components/table', icon: 'i-glyph:table' },
				{ title: 'Timeline', slug: '/playground/components/timeline', icon: 'i-glyph:timeline' },
				{
					title: 'Table of Contents',
					slug: '/playground/components/toc',
					icon: 'i-glyph:list-unordered'
				}
			]
		},
		{
			title: 'Layout',
			icon: 'i-glyph:layers-minimalistic',
			children: [
				{
					title: 'Carousel',
					slug: '/playground/components/carousel',
					icon: 'i-glyph:carousel'
				},
				{
					title: 'Toolbar',
					slug: '/playground/components/toolbar',
					icon: 'i-glyph:toolbar'
				},
				{
					title: 'Floating Action',
					slug: '/playground/components/floating-action',
					icon: 'i-glyph:floating-action'
				},
				{
					title: 'Floating Navigation',
					slug: '/playground/components/floating-navigation',
					icon: 'i-glyph:floating-navigation'
				},
				{
					title: 'Palette Manager',
					slug: '/playground/components/palette-manager',
					icon: 'i-glyph:palette-manager'
				},
				{ title: 'Progress', slug: '/playground/components/progress', icon: 'i-glyph:progress' }
			]
		},
		{
			title: 'Charts',
			icon: 'i-glyph:chart',
			children: [
				{ title: 'Sparkline', slug: '/playground/components/sparkline', icon: 'i-glyph:chart-square' }
			]
		},
		{
			title: 'Design Resources',
			icon: 'i-glyph:stars',
			children: [{ title: 'Icons', slug: '/playground/icons', icon: 'i-glyph:stars' }]
		},
		{
			title: 'Themes',
			icon: 'i-glyph:palette-manager',
			children: [
				{ title: 'Core Components', slug: '/playground/themes/components', icon: 'i-glyph:list' },
				{ title: 'Inputs & Buttons', slug: '/playground/themes/inputs', icon: 'i-glyph:keyboard' },
				{ title: 'Cards', slug: '/playground/themes/cards', icon: 'i-glyph:card' },
				{ title: 'Navigation', slug: '/playground/themes/navigation', icon: 'i-glyph:breadcrumbs' },
				{ title: 'Feedback & Display', slug: '/playground/themes/display', icon: 'i-glyph:star' }
			]
		},
		{
			title: 'Effects',
			icon: 'i-glyph:magic-stick',
			children: [
				{ title: 'Reveal', slug: '/playground/effects/reveal', icon: 'i-glyph:eye' },
				{
					title: 'Shine',
					slug: '/playground/effects/shine',
					icon: 'i-glyph:chart-square'
				},
				{ title: 'Tilt', slug: '/playground/effects/tilt', icon: 'i-glyph:cursor' }
			]
		}
	]

	const fields = { label: 'title', href: 'slug', icon: 'icon', value: 'slug' }

	let slug = $derived(page.url.pathname.split('/').pop())
	let isComponent = $derived(page.url.pathname.includes('/playground/components/'))
	let isEffect = $derived(page.url.pathname.includes('/playground/effects/'))
	const docsHref = $derived(
		isComponent ? `/docs/components/${slug}` : isEffect ? `/docs/effects/${slug}` : null
	)
	const llmsHref = $derived(isComponent ? `/llms/components/${slug}.txt` : null)
</script>

<div class="flex min-h-0 flex-1 overflow-hidden">
	<aside class="border-surface-z2 bg-surface-z1 w-64 flex-shrink-0 overflow-y-auto border-r">
		<div class="p-3">
			<List items={sections} {fields} value={page.url.pathname} collapsible />
		</div>
	</aside>

	<main
		data-playground-content
		class="bg-surface-z1 text-surface-z8 flex min-w-0 flex-1 flex-col overflow-hidden"
	>
		{@render children()}
	</main>
</div>
