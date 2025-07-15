<script>
	import { Tabs } from '@rokkit/ui'

	let items = [
		{ text: 'Fruits', description: '🍎 Fresh seasonal fruits including apples, bananas, and berries' },
		{ text: 'Vegetables', description: '🥬 Nutritious vegetables like spinach, carrots, and bell peppers' },
		{ text: 'Nuts', description: '🥜 Protein-rich nuts and seeds for healthy snacking' },
		{ text: 'Spices', description: '🌶️ Aromatic spices and herbs to enhance your cooking' }
	]
	
	let value = $state(items[0])
</script>

<Tabs {items} bind:value>
	<div>
		<h3>Selected: {value.text}</h3>
		<p>{value.description}</p>
	</div>
</Tabs>