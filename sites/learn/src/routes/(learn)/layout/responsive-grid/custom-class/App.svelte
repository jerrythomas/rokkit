<script>
	import { ResponsiveGrid, Switch } from '@rokkit/ui'
	import PlaceHolder from './PlaceHolder.svelte'

	let items = [
		{
			component: PlaceHolder,
			name: 'Section A',
			props: {
				content: 'Section A',
				class: 'bg-pink-500 h-24'
			}
		},
		{
			component: PlaceHolder,
			name: 'Section B',
			props: { 
				content: 'Section B', 
				class: 'bg-sky-500 h-24' 
			}
		},
		{
			component: PlaceHolder,
			name: 'Section C',
			props: {
				content: 'Section C',
				class: 'bg-teal-500 h-24'
			}
		},
		{
			component: PlaceHolder,
			name: 'Section D',
			props: {
				content: 'Section D',
				class: 'bg-yellow-500 h-24'
			}
		}
	]
	
	let size = $state('lg')
	let page = $state(items[0])
	
	$: customClass = getCustomClass(size)
	
	function getCustomClass(size) {
		const base = 'grid gap-4 h-48'
		switch(size) {
			case 'sm': return `${base} grid-cols-1`
			case 'md': return `${base} grid-cols-1 grid-rows-4`
			case 'lg': return `${base} grid-cols-2 grid-rows-2`
			default: return base
		}
	}
</script>

<style>
	/* Custom responsive grid styles */
	.custom-grid.sm {
		@apply grid-cols-1;
	}
	.custom-grid.md {
		@apply grid-cols-1 grid-rows-4;
	}
	.custom-grid.lg {
		@apply grid-cols-2 grid-rows-2;
	}
</style>

<div class="space-y-4">
	<div>
		<label class="text-sm font-medium">Layout Size:</label>
		<Switch options={['sm', 'md', 'lg']} bind:value={size} class="text-xs ml-2" />
	</div>
	
	<ResponsiveGrid 
		{items} 
		small={size === 'sm'} 
		class={customClass}
		bind:value={page} 
	/>
	
	{#if size === 'sm'}
		<div>
			<label class="text-sm font-medium">Active Section:</label>
			<Switch 
				options={items} 
				fields={{ text: 'name' }} 
				bind:value={page}
				class="ml-2"
			/>
		</div>
	{/if}
	
	<div class="text-sm">
		<strong>Current Layout:</strong> {size.toUpperCase()} - <strong>Selected:</strong> {page?.name || 'None'}
	</div>
</div>