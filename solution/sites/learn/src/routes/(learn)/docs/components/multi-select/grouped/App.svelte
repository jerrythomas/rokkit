<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'

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
				{ text: 'Broccoli', value: 'broccoli' }
			]
		}
	]
	let value = $state([])
</script>

<div class="w-[300px]">
	<MultiSelect {items} bind:value placeholder="Choose foods" />
</div>

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value.join(', ') || 'none'}</strong></p>
