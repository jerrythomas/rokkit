<script>
	import { Tabs } from '@rokkit/ui'
	let value
	let options = [
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
</script>

<Tabs {options} bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
