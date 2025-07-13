<script>
	import { Select } from '@rokkit/ui'
	
	const options = [
		{
			name: 'Fruits',
			photo: '/examples/fruits.jpg'
		},
		{
			name: 'Vegetables',
			photo: '/examples/vegetables.jpg'
		},
		{
			name: 'Nuts',
			photo: '/examples/nuts.jpg'
		},
		{
			name: 'Spices',
			photo: '/examples/spices.jpg'
		}
	]

	let fields = { text: 'name', image: 'photo' }
	let value = $state(null)
</script>

<Select {options} {fields} bind:value placeholder="Choose a category" />

<div class="mt-4">
	<p><strong>Selected Value:</strong></p>
	<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
</div>