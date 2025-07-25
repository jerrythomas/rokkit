<script>
	import { Tabs } from '@rokkit/ui'

	let value = $state()
	let items = [
		{
			text: 'Fruits',
			content: 'Fresh seasonal fruits including apples, bananas, and berries.',
			image: '/examples/fruits.jpg'
		},
		{
			text: 'Vegetables',
			content: 'Nutritious vegetables like spinach, carrots, and bell peppers.',
			image: '/examples/vegetables.jpg'
		},
		{
			text: 'Nuts',
			content: 'Protein-rich nuts and seeds for healthy snacking.',
			image: '/examples/nuts.jpg'
		},
		{
			text: 'Spices',
			content: 'Aromatic spices and herbs to enhance your cooking.',
			image: '/examples/spices.jpg'
		}
	]
</script>

<Tabs {items} bind:value fields={{ text: 'text', content: 'content' }}>
	<div class="space-y-4 p-6">
		{#if value}
			<div class="flex items-center gap-4">
				<img src={value.image} alt={value.text} class="h-16 w-16 rounded-lg object-cover" />
				<div>
					<h3 class="text-lg font-semibold">{value.text}</h3>
					<p class="text-surface-z7 text-sm">{value.content}</p>
				</div>
			</div>
		{:else}
			<p class="text-surface-z7">Select a tab to see the content</p>
		{/if}
	</div>
</Tabs>
