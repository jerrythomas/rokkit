<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const items = [
		{
			label: 'Fruits',
			children: [
				{ label: 'Apple', value: 'apple' },
				{ label: 'Banana', value: 'banana' }
			]
		},
		{
			label: 'Vegetables',
			children: [
				{ label: 'Carrot', value: 'carrot' },
				{ label: 'Broccoli', value: 'broccoli' }
			]
		}
	]
	let value = $state(null)
</script>

<Select {items} bind:value placeholder="Choose a food" />
