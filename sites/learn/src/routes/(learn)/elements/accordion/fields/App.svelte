<script>
	import { Accordion } from '@rokkit/ui'
	
	const items = [
		{
			name: 'Fruits',
			values: [
				{ name: 'Apple', photo: '/examples/apple.jpg' },
				{ name: 'Banana', photo: '/examples/bananas.jpg' },
				{ name: 'Orange', photo: '/examples/orange.jpg' },
				{ name: 'Avocado', photo: '/examples/avocado.jpg' }
			]
		},
		{
			name: 'Vegetables',
			values: [
				{ name: 'Carrot', photo: '/examples/carrot.jpg' },
				{ name: 'Tomato', photo: '/examples/tomato.jpg' },
				{ name: 'Lettuce', photo: '/examples/lettuce.jpg' }
			]
		}
	]

	const fields = {
		text: 'name',
		children: 'values',
		image: 'photo'
	}
	
	let value = $state(null)
</script>

<Accordion {items} {fields} autoClose bind:value />

<div class="mt-4">
	<p><strong>Selected Item:</strong></p>
	<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
</div>