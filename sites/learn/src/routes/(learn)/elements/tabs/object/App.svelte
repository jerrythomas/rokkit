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
	<div class="p-6 space-y-4">
		{#if value}
			<div class="flex items-center gap-4">
				<img src={value.image} alt={value.text} class="w-16 h-16 object-cover rounded-lg" />
				<div>
					<h3 class="text-lg font-semibold">{value.text}</h3>
					<p class="text-neutral-floating text-sm">{value.content}</p>
				</div>
			</div>
		{:else}
			<p class="text-neutral-floating">Select a tab to see the content</p>
		{/if}
	</div>
</Tabs>
