<script>
	import { List } from '@rokkit/ui'
	let value = $state(null)
	let items = $state([
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
	])
</script>

<List bind:items bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
