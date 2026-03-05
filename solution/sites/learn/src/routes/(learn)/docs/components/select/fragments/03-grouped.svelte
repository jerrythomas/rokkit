<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const items = [
		{
			text: 'Fruits',
			children: [
				{ text: 'Apple', value: 'apple' },
				{ text: 'Banana', value: 'banana' }
			]
		},
		{
			text: 'Vegetables',
			children: [
				{ text: 'Carrot', value: 'carrot' },
				{ text: 'Broccoli', value: 'broccoli' }
			]
		}
	]
	let value = $state(null)
</script>

<Select {items} bind:value placeholder="Choose a food" />
