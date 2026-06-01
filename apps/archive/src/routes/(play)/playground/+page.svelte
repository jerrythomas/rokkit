<script>
	// @ts-nocheck
	import { Card } from '@rokkit/ui'

	const GROUPS = [
		{
			title: 'Navigation & Selection',
			icon: 'i-glyph:list-check',
			basePath: '/playground/components/',
			components: [
				{ name: 'Breadcrumbs', description: 'Navigation path with links', slug: 'breadcrumbs' },
				{ name: 'Lazy Tree', description: 'Async-loaded tree component', slug: 'lazy-tree' },
				{ name: 'List', description: 'Data-driven list with field mapping', slug: 'list' },
				{
					name: 'Dropdown',
					description: 'Compact dropdown showing selected value',
					slug: 'dropdown'
				},
				{ name: 'Menu', description: 'Popup menu with keyboard navigation', slug: 'menu' },
				{
					name: 'Multi Select',
					description: 'Multi-value dropdown selection',
					slug: 'multi-select'
				},
				{ name: 'Select', description: 'Single-value dropdown selection', slug: 'select' },
				{ name: 'Tabs', description: 'Tabbed content panels', slug: 'tabs' },
				{
					name: 'Toggle',
					description: 'Toggle group for mutually exclusive options',
					slug: 'toggle'
				},
				{ name: 'Tree', description: 'Collapsible hierarchical tree', slug: 'tree' },
			{ name: 'Grid', description: 'Responsive selectable tile grid', slug: 'grid' }
		]
		},
		{
			title: 'Inputs',
			icon: 'i-glyph:keyboard',
			basePath: '/playground/components/',
			components: [
				{ name: 'Button', description: 'Action button with variants', slug: 'button' },
				{
					name: 'Inputs',
					description: 'Text, number, textarea and validation states',
					slug: 'inputs'
				},
				{ name: 'Range', description: 'Numeric range slider', slug: 'range' },
				{ name: 'Rating', description: 'Star rating input', slug: 'rating' },
				{ name: 'Stepper', description: 'Step-by-step progress input', slug: 'stepper' },
				{ name: 'Switch', description: 'On/off toggle switch', slug: 'switch' },
				{
					name: 'Upload Progress',
					description: 'File upload progress indicator',
					slug: 'upload-progress'
				},
				{ name: 'Upload Target', description: 'Drag-and-drop upload zone', slug: 'upload-target' }
			]
		},
		{
			title: 'Display',
			icon: 'i-glyph:gallery-wide',
			basePath: '/playground/components/',
			components: [
				{
					name: 'Card',
					description: 'Content container with optional header/footer',
					slug: 'card'
				},
				{ name: 'Code', description: 'Syntax-highlighted code block', slug: 'code' },
				{ name: 'Forms', description: 'Schema-driven form renderer', slug: 'forms' },
				{ name: 'Message', description: 'Inline alerts and toast notifications', slug: 'message' },
				{ name: 'Pill', description: 'Compact tag or badge element', slug: 'pill' },
				{
					name: 'Status List',
					description: 'Validation rule summary with pass/fail/warn/unknown icons',
					slug: 'status-list'
				},
				{ name: 'Table', description: 'Sortable tabular data display', slug: 'table' },
				{ name: 'Timeline', description: 'Chronological event display', slug: 'timeline' }
			]
		},
		{
			title: 'Layout',
			icon: 'i-glyph:layers-minimalistic',
			basePath: '/playground/components/',
			components: [
				{ name: 'Carousel', description: 'Horizontally scrolling item carousel', slug: 'carousel' },
				{
					name: 'Floating Action',
					description: 'Floating action button overlay',
					slug: 'floating-action'
				},
				{
					name: 'Floating Navigation',
					description: 'Floating navigation overlay',
					slug: 'floating-navigation'
				},
				{
					name: 'Palette Manager',
					description: 'Color palette selection UI',
					slug: 'palette-manager'
				},
				{ name: 'Progress', description: 'Progress bar indicator', slug: 'progress' }
			]
		},
		{
			title: 'Effects',
			icon: 'i-glyph:magic-stick',
			basePath: '/playground/effects/',
			components: [
				{ name: 'Reveal', description: 'Scroll-triggered reveal animation', slug: 'reveal' },
				{ name: 'Shine', description: 'SVG specular lighting effect', slug: 'shine' },
				{ name: 'Tilt', description: '3D tilt effect on hover', slug: 'tilt' }
			]
		},
		{
			title: 'Design Resources',
			icon: 'i-glyph:stars',
			basePath: '/playground/',
			components: [
				{
					name: 'Icons',
					description: 'Browse all icon collections and auth icon variants',
					slug: 'icons'
				}
			]
		}
	]
</script>

<div class="p-8">
	<div class="mb-8">
		<h2 class="text-surface-z8 mb-1 text-2xl font-semibold">Playground</h2>
		<p class="text-surface-z5">Select a component or effect to open its interactive playground.</p>
	</div>

	{#each GROUPS as group (group.title)}
		<section class="mb-10">
			<div class="mb-4 flex items-center gap-2">
				<span class="{group.icon} text-secondary-z7 text-xl" aria-hidden="true"></span>
				<h3 class="text-surface-z7 m-0 text-base font-semibold">{group.title}</h3>
			</div>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each group.components as component (component.slug)}
					<Card
						class="hover:border-primary-z5 transition-colors"
						href={`${group.basePath}${component.slug}`}
					>
						<h4 class="text-surface-z8 mb-1 text-sm font-semibold">{component.name}</h4>
						<p class="text-surface-z5 text-xs leading-relaxed">{component.description}</p>
					</Card>
				{/each}
			</div>
		</section>
	{/each}
</div>
