<script>
	import { Accordion } from '@rokkit/core'
	let items = [
		{
			text: 'Fruits',
			data: ['Apple', 'Orange', 'Bananna', 'Avocado']
		},
		{
			text: 'Vegetables',
			data: ['Carrot', 'Tomato', 'Lettuce']
		},
		{
			text: 'Nuts',
			data: ['Almonds', 'Walnuts', 'Pistachios']
		},
		{
			text: 'Spices',
			data: ['Cinnamon', 'Cloves', 'Turmeric']
		}
	]
	let value
</script>

<Accordion {items} bind:value />

<p>Selected Value :</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
