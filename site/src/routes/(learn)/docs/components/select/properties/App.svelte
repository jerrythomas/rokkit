<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const fruits = [
		{ label: 'Apple', value: 'apple', icon: 'i-glyph:close-circle' },
		{ label: 'Banana', value: 'banana', icon: 'i-glyph:close-circle' },
		{ label: 'Cherry', value: 'cherry', icon: 'i-glyph:close-circle' },
		{ label: 'Date', value: 'date', icon: 'i-glyph:close-circle', disabled: true },
		{ label: 'Elderberry', value: 'elderberry', icon: 'i-glyph:close-circle' }
	]
	let value = $state(null)
</script>

<Select items={fruits} bind:value placeholder="Choose a fruit" />

<p class="text-surface-z5 mt-3 text-sm">Selected: <strong>{value ?? 'none'}</strong></p>
