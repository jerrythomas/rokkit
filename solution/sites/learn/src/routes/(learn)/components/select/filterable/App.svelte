<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const countries = [
		{ text: 'Australia', value: 'AU' },
		{ text: 'Brazil', value: 'BR' },
		{ text: 'Canada', value: 'CA' },
		{ text: 'Denmark', value: 'DK' },
		{ text: 'Egypt', value: 'EG' },
		{ text: 'Finland', value: 'FI' },
		{ text: 'Germany', value: 'DE' },
		{ text: 'Hungary', value: 'HU' },
		{ text: 'India', value: 'IN' },
		{ text: 'Japan', value: 'JP' },
		{ text: 'Kenya', value: 'KE' },
		{ text: 'Luxembourg', value: 'LU' }
	]

	let value = $state(null)
</script>

<Select items={countries} bind:value filterable placeholder="Select a country" />

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value ?? 'none'}</strong></p>
