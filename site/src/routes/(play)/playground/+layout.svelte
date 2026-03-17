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
				{ title: 'Card', slug: '/playground/components/card', icon: 'i-glyph:card' },
				{ title: 'Code', slug: '/playground/components/code', icon: 'i-glyph:code' },
				{ title: 'Forms', slug: '/playground/components/forms', icon: 'i-glyph:forms' },
				{ title: 'Grid', slug: '/playground/components/grid', icon: 'i-glyph:grid' },
				{ title: 'Pill', slug: '/playground/components/pill', icon: 'i-glyph:pill' },
				{
					title: 'Search Filter',
					slug: '/playground/components/search-filter',
					icon: 'i-glyph:search-filter'
				},
				{ title: 'Table', slug: '/playground/components/table', icon: 'i-glyph:table' },
				{ title: 'Timeline', slug: '/playground/components/timeline', icon: 'i-glyph:timeline' }
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
			title: 'Design Resources',
			icon: 'i-glyph:stars',
			children: [{ title: 'Icons', slug: '/playground/icons', icon: 'i-glyph:stars' }]
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

<div class="flex min-h-0 flex-1 flex-col">
	<header class="bg-surface-z2 border-surface-z2 text-surface-z7 border-b px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-semibold">Playground</h1>
				<p class="text-surface-z5 text-sm">
					Interactive testing environment for Rokkit components and effects
				</p>
			</div>
			<a href="/playground" class="text-surface-z5 hover:text-surface-z7 text-sm"
				>← Back to Overview</a
			>
		</div>
	</header>

	<div class="flex min-h-0 flex-1 overflow-hidden">
		<aside class="border-surface-z2 bg-surface-z1 w-64 flex-shrink-0 overflow-y-auto border-r">
			<div class="p-3">
				<List items={sections} {fields} value={page.url.pathname} collapsible />
			</div>
		</aside>

		<main
			data-playground-content
			class="bg-surface-z1 text-surface-z8 relative flex min-w-0 flex-1 flex-col overflow-auto"
		>
			{#if docsHref || llmsHref}
				<div class="absolute top-4 right-4 z-10 flex items-center gap-1">
					{#if docsHref}
						<a
							href={docsHref}
							class="text-surface-z5 hover:bg-surface-z3 hover:text-surface-z8 flex h-8 w-8 items-center justify-center rounded-md no-underline"
							title="View Documentation"
							aria-label="View Documentation"
						>
							<span class="i-glyph:book-2 inline-block text-lg" aria-hidden="true"
							></span>
						</a>
					{/if}
					{#if llmsHref}
						<a
							href={llmsHref}
							target="_blank"
							rel="noopener noreferrer"
							class="text-surface-z5 hover:bg-surface-z3 hover:text-surface-z8 flex h-8 w-8 items-center justify-center rounded-md no-underline"
							title="View llms.txt"
							aria-label="View llms.txt"
						>
							<span class="i-glyph:file-text inline-block text-lg" aria-hidden="true"
							></span>
						</a>
					{/if}
				</div>
			{/if}
			{@render children()}
		</main>
	</div>
</div>
