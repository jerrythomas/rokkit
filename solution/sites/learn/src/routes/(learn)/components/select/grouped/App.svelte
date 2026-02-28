<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const options = [
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

<Select {options} bind:value placeholder="Choose a food" />

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value ?? 'none'}</strong></p>
