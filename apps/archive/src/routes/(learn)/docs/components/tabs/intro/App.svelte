<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'

	let options = [
		{
			label: 'Fruits',
			description: '🍎 Fresh seasonal fruits including apples, bananas, and berries'
		},
		{
			label: 'Vegetables',
			description: '🥬 Nutritious vegetables like spinach, carrots, and bell peppers'
		},
		{ label: 'Nuts', description: '🥜 Protein-rich nuts and seeds for healthy snacking' },
		{ label: 'Spices', description: '🌶️ Aromatic spices and herbs to enhance your cooking' }
	]

	let value = $state(options[0])
</script>

<Tabs {options} bind:value>
	{#snippet tabPanel(item)}
		<div>
			<h3>Selected: {item.value.label}</h3>
			<p>{item.value.description}</p>
		</div>
	{/snippet}
</Tabs>
