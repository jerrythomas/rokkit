<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'

	let options = [
		{
			text: 'Fruits',
			description: '🍎 Fresh seasonal fruits including apples, bananas, and berries'
		},
		{
			text: 'Vegetables',
			description: '🥬 Nutritious vegetables like spinach, carrots, and bell peppers'
		},
		{ text: 'Nuts', description: '🥜 Protein-rich nuts and seeds for healthy snacking' },
		{ text: 'Spices', description: '🌶️ Aromatic spices and herbs to enhance your cooking' }
	]

	let value = $state(options[0])
</script>

<Tabs {options} bind:value>
	{#snippet tabPanel(item)}
		<div>
			<h3>Selected: {item.value.text}</h3>
			<p>{item.value.description}</p>
		</div>
	{/snippet}
</Tabs>
