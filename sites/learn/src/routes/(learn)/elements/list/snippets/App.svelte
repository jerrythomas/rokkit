<script>
	import { List } from '@rokkit/ui'
	let value = $state(null)
	let items = $state([])

	function reset() {
		items = [
			{
				text: 'Fruits',
				image: '/examples/fruits.jpg'
			},
			{
				text: 'Vegetables',
				image: '/examples/vegetables.jpg'
			},
			{
				text: 'Nuts',
				image: '/examples/nuts.jpg'
			},
			{
				text: 'Spices',
				image: '/examples/spices.jpg'
			}
		]
	}
	function clear() {
		items = []
		value = null
	}
</script>

<List bind:items bind:value>
	{#snippet header()}
		<div class="bg-neutral-z2 text-on-neutral-z2 border-neutral-z3 border-b p-2 italic">
			List of fruits
		</div>
	{/snippet}
	{#snippet empty()}
		<div class="bg-neutral-z2 text-on-neutral-z2 min-h-30 flex items-center justify-center italic">
			No items. Press the reset button
		</div>
	{/snippet}
	{#snippet footer()}
		<span class="border-neutral-z3 flex justify-center gap-2 border-t py-2">
			<button onclick={clear}>Clear</button>
			<button onclick={reset}>Reset</button>
		</span>
	{/snippet}
</List>

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
