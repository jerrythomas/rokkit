<script>
	import { Tabs } from '@rokkit/ui'
	import Controls from './Controls.svelte'
	
	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value = $state(items[0])
	let properties = $state([
		{ label: 'Orientation', value: 'horizontal', options: ['horizontal', 'vertical'] },
		{ label: 'Position', value: 'before', options: ['before', 'after'] },
		{ label: 'Align', value: 'start', options: ['start', 'center', 'end'] }
	])
</script>

<Controls bind:properties />

<Tabs 
	{items} 
	bind:value 
	orientation={properties[0].value}
	position={properties[1].value}
	align={properties[2].value}
>
	<div class="p-6 space-y-3">
		<h3 class="text-lg font-semibold">Selected: {value}</h3>
		<p class="text-neutral-floating">
			{#if value === 'Fruits'}
				🍎 Fresh apples, bananas, and seasonal berries
			{:else if value === 'Vegetables'}
				🥬 Leafy greens and colorful vegetables
			{:else if value === 'Nuts'}
				🥜 Protein-rich nuts and seeds
			{:else if value === 'Spices'}
				🌶️ Aromatic spices and herbs
			{/if}
		</p>
	</div>
</Tabs>
