<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const countries = [
		{ name: 'United States', code: 'US', flag: 'i-circle-flags:us' },
		{ name: 'United Kingdom', code: 'GB', flag: 'i-circle-flags:gb' },
		{ name: 'Germany', code: 'DE', flag: 'i-circle-flags:de' },
		{ name: 'France', code: 'FR', flag: 'i-circle-flags:fr' },
		{ name: 'Japan', code: 'JP', flag: 'i-circle-flags:jp' }
	]

	const fields = { label: 'name', value: 'code', icon: 'flag' }
	let value = $state(null)
</script>

<Select items={countries} {fields} bind:value placeholder="Select a country" />

<p class="text-surface-z5 mt-3 text-sm">Selected code: <strong>{value ?? 'none'}</strong></p>
