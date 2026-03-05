<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const items = [
		{
			text: 'Fruits',
			children: [
				{ text: 'Apple', value: 'apple' },
				{ text: 'Banana', value: 'banana' },
				{ text: 'Cherry', value: 'cherry' }
			]
		},
		{
			text: 'Vegetables',
			children: [
				{ text: 'Carrot', value: 'carrot' },
				{ text: 'Broccoli', value: 'broccoli' },
				{ text: 'Spinach', value: 'spinach' }
			]
		}
	]

	let value = $state(null)
</script>

<Select {items} bind:value placeholder="Choose a food" />

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value ?? 'none'}</strong></p>
