<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const items = [
		{
			label: 'Fruits',
			children: [
				{ label: 'Apple', value: 'apple' },
				{ label: 'Banana', value: 'banana' },
				{ label: 'Cherry', value: 'cherry' }
			]
		},
		{
			label: 'Vegetables',
			children: [
				{ label: 'Carrot', value: 'carrot' },
				{ label: 'Broccoli', value: 'broccoli' },
				{ label: 'Spinach', value: 'spinach' }
			]
		}
	]

	let value = $state(null)
</script>

<Select {items} bind:value placeholder="Choose a food" />

<p class="text-surface-z5 mt-3 text-sm">Selected: <strong>{value ?? 'none'}</strong></p>
