<script>
	// @ts-nocheck
	import { goto } from '$app/navigation'
	import { Button, Card } from '@rokkit/ui'

	const GROUPS = [
		{
			title: 'Navigation & Selection',
			icon: 'i-solar:list-check-bold-duotone',
			components: [
				{ name: 'Breadcrumbs', description: 'Navigation path with links', slug: 'breadcrumbs' },
				{ name: 'Lazy Tree', description: 'Async-loaded tree component', slug: 'lazy-tree' },
				{ name: 'List', description: 'Data-driven list with field mapping', slug: 'list' },
				{ name: 'Menu', description: 'Popup menu with keyboard navigation', slug: 'menu' },
				{ name: 'Multi Select', description: 'Multi-value dropdown selection', slug: 'multi-select' },
				{ name: 'Select', description: 'Single-value dropdown selection', slug: 'select' },
				{ name: 'Tabs', description: 'Tabbed content panels', slug: 'tabs' },
				{ name: 'Toggle', description: 'Toggle group for mutually exclusive options', slug: 'toggle' },
				{ name: 'Tree', description: 'Collapsible hierarchical tree', slug: 'tree' }
			]
		},
		{
			title: 'Inputs',
			icon: 'i-solar:keyboard-bold-duotone',
			components: [
				{ name: 'Button', description: 'Action button with variants', slug: 'button' },
				{ name: 'Range', description: 'Numeric range slider', slug: 'range' },
				{ name: 'Rating', description: 'Star rating input', slug: 'rating' },
				{ name: 'Stepper', description: 'Step-by-step progress input', slug: 'stepper' },
				{ name: 'Switch', description: 'On/off toggle switch', slug: 'switch' },
				{ name: 'Upload Progress', description: 'File upload progress indicator', slug: 'upload-progress' },
				{ name: 'Upload Target', description: 'Drag-and-drop upload zone', slug: 'upload-target' }
			]
		},
		{
			title: 'Display',
			icon: 'i-solar:gallery-wide-bold-duotone',
			components: [
				{ name: 'Card', description: 'Content container with optional header/footer', slug: 'card' },
				{ name: 'Code', description: 'Syntax-highlighted code block', slug: 'code' },
				{ name: 'Forms', description: 'Schema-driven form renderer', slug: 'forms' },
				{ name: 'Pill', description: 'Compact tag or badge element', slug: 'pill' },
				{ name: 'Table', description: 'Sortable tabular data display', slug: 'table' },
				{ name: 'Timeline', description: 'Chronological event display', slug: 'timeline' }
			]
		},
		{
			title: 'Layout',
			icon: 'i-solar:layers-minimalistic-bold-duotone',
			components: [
				{ name: 'Carousel', description: 'Horizontally scrolling item carousel', slug: 'carousel' },
				{ name: 'Floating Action', description: 'Floating action button overlay', slug: 'floating-action' },
				{ name: 'Floating Navigation', description: 'Floating navigation overlay', slug: 'floating-navigation' },
				{ name: 'Palette Manager', description: 'Color palette selection UI', slug: 'palette-manager' },
				{ name: 'Progress', description: 'Progress bar indicator', slug: 'progress' }
			]
		}
	]
</script>

<div class="p-8">
	<div class="mb-8">
		<h2 class="text-2xl font-semibold text-surface-z8 mb-1">Component Playground</h2>
		<p class="text-surface-z5">Select a component to open its interactive playground.</p>
	</div>

	{#each GROUPS as group}
		<section class="mb-10">
			<div class="flex items-center gap-2 mb-4">
				<span class="{group.icon} text-xl text-secondary-z7" aria-hidden="true"></span>
				<h3 class="text-base font-semibold text-surface-z7 m-0">{group.title}</h3>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
				{#each group.components as component (component.slug)}
					<Card onclick={() => goto(`/playground/components/${component.slug}`)}>
						<h4 class="text-sm font-semibold text-surface-z8 mb-1">{component.name}</h4>
						<p class="text-xs text-surface-z5 mb-3 leading-relaxed">{component.description}</p>
						<Button size="sm" onclick={() => goto(`/playground/components/${component.slug}`)}>
							Open
						</Button>
					</Card>
				{/each}
			</div>
		</section>
	{/each}
</div>
