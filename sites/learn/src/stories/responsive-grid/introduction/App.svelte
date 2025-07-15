<script>
	import { ResponsiveGrid, Switch } from '@rokkit/ui'
	import PlaceHolder from './PlaceHolder.svelte'

	let items = [
		{
			component: PlaceHolder,
			name: 'Dashboard',
			props: {
				content: 'Dashboard',
				class: 'bg-pink-500 h-32'
			}
		},
		{
			component: PlaceHolder,
			name: 'Analytics',
			props: { 
				content: 'Analytics', 
				class: 'bg-sky-500 h-32' 
			}
		},
		{
			component: PlaceHolder,
			name: 'Reports',
			props: {
				content: 'Reports',
				class: 'bg-teal-500 h-32'
			}
		},
		{
			component: PlaceHolder,
			name: 'Settings',
			props: {
				content: 'Settings',
				class: 'bg-purple-500 h-32'
			}
		}
	]
	
	let size = $state('lg')
	let page = $state(items[0])
	
	$: gridClass = size === 'sm' ? 'grid-cols-1' : 
	              size === 'md' ? 'grid-cols-1 grid-rows-4' : 
	              'grid-cols-2 grid-rows-2'
</script>

<div class="space-y-4">
	<div>
		<label class="text-sm font-medium">Grid Size:</label>
		<Switch options={['sm', 'md', 'lg']} bind:value={size} class="text-xs ml-2" />
	</div>
	
	<ResponsiveGrid 
		{items} 
		small={size === 'sm'} 
		class="grid gap-4 h-64 {gridClass}" 
		bind:value={page} 
	/>
	
	{#if size === 'sm'}
		<div>
			<label class="text-sm font-medium">Selected Page:</label>
			<Switch 
				options={items} 
				fields={{ text: 'name' }} 
				bind:value={page} 
				class="ml-2"
			/>
		</div>
	{/if}
	
	<div class="text-sm">
		<strong>Current Selection:</strong> {page?.name || 'None'}
	</div>
</div>