<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'

	let value = $state()
	let options = [
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

<Tabs {options} bind:value fields={{ label: 'text', content: 'content' }}>
	<div class="space-y-4 p-6">
		{#snippet tabPanel(item)}
			<div class="flex items-center gap-4">
				<img
					src={item.value.image}
					alt={item.value.text}
					class="h-16 w-16 rounded-lg object-cover"
				/>
				<div>
					<h3 class="text-lg font-semibold">{item.value.text}</h3>
					<p class="text-surface-z7 text-sm">{item.value.content}</p>
				</div>
			</div>
		{/snippet}
		<!-- <p class="text-surface-z7">Select a tab to see the content</p> -->
	</div>
</Tabs>
