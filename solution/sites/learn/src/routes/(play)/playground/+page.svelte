<script>
	// @ts-nocheck
	import { goto } from '$app/navigation'
	import { Button, Card } from '@rokkit/ui'

	const components = [
		{ name: 'Button', description: 'Button component with various styles and sizes', path: '/components/button' },
		{ name: 'Breadcrumbs', description: 'Navigation breadcrumbs component', path: '/components/breadcrumbs' },
		{ name: 'Card', description: 'Card container component', path: '/components/card' },
		{ name: 'Carousel', description: 'Carousel/slider component', path: '/components/carousel' },
		{ name: 'Code', description: 'Code display component', path: '/components/code' },
		{ name: 'Floating Action', description: 'Floating action button component', path: '/components/floating-action' },
		{ name: 'Floating Navigation', description: 'Floating navigation component', path: '/components/floating-navigation' },
		{ name: 'Forms', description: 'Form components and utilities', path: '/components/forms' },
		{ name: 'Lazy Tree', description: 'Lazy-loaded tree component', path: '/components/lazy-tree' },
		{ name: 'List', description: 'Data-driven list component with field mapping', path: '/components/list' },
		{ name: 'Menu', description: 'Menu component', path: '/components/menu' },
		{ name: 'Multi Select', description: 'Multi-select component', path: '/components/multi-select' },
		{ name: 'Palette Manager', description: 'Color palette management component', path: '/components/palette-manager' },
		{ name: 'Pill', description: 'Pill/badge component', path: '/components/pill' },
		{ name: 'Progress', description: 'Progress indicator component', path: '/components/progress' },
		{ name: 'Range', description: 'Range slider component', path: '/components/range' },
		{ name: 'Rating', description: 'Star rating component', path: '/components/rating' },
		{ name: 'Select', description: 'Select dropdown component', path: '/components/select' },
		{ name: 'Stepper', description: 'Step progress component', path: '/components/stepper' },
		{ name: 'Switch', description: 'Toggle switch component', path: '/components/switch' },
		{ name: 'Table', description: 'Data table component', path: '/components/table' },
		{ name: 'Tabs', description: 'Tabbed navigation component', path: '/components/tabs' },
		{ name: 'Timeline', description: 'Timeline component', path: '/components/timeline' },
		{ name: 'Toggle', description: 'Toggle component', path: '/components/toggle' },
		{ name: 'Tree', description: 'Tree component', path: '/components/tree' },
		{ name: 'Upload Progress', description: 'Upload progress indicator', path: '/components/upload-progress' },
		{ name: 'Upload Target', description: 'Upload drop zone component', path: '/components/upload-target' }
	]

	function navigateToComponent(component) {
		goto(`/playground${component.path}`)
	}
</script>

<div class="playground-home p-8">
	<section class="intro mb-8">
		<h2 class="text-2xl font-semibold text-surface-z8">Choose a Component to Test</h2>
		<p class="text-surface-z5">
			Select a component below to open its interactive playground where you can test different
			configurations and see live results.
		</p>
	</section>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each components as component (component.path)}
			<Card>
				<h3 class="text-lg font-semibold text-surface-z8">{component.name}</h3>
				<p class="text-sm text-surface-z5 mb-4">{component.description}</p>
				<Button onclick={() => navigateToComponent(component)} size="sm">
					Test {component.name}
				</Button>
			</Card>
		{/each}
	</div>
</div>
