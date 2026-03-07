<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'

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
				{ label: 'Broccoli', value: 'broccoli' }
			]
		}
	]
	let value = $state([])
</script>

<div class="w-[300px]">
	<MultiSelect {items} bind:value placeholder="Choose foods" />
</div>

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value.join(', ') || 'none'}</strong></p>
