<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const countries = [
		{ label: 'Australia', value: 'AU' },
		{ label: 'Brazil', value: 'BR' },
		{ label: 'Canada', value: 'CA' },
		{ label: 'Denmark', value: 'DK' },
		{ label: 'Egypt', value: 'EG' },
		{ label: 'Finland', value: 'FI' },
		{ label: 'Germany', value: 'DE' },
		{ label: 'Hungary', value: 'HU' },
		{ label: 'India', value: 'IN' },
		{ label: 'Japan', value: 'JP' },
		{ label: 'Kenya', value: 'KE' },
		{ label: 'Luxembourg', value: 'LU' }
	]

	let value = $state(null)
</script>

<Select options={countries} bind:value filterable placeholder="Select a country" />

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value ?? 'none'}</strong></p>
