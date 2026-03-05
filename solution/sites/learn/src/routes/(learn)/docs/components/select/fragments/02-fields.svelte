<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const countries = [
		{ name: 'United States', code: 'US' },
		{ name: 'Germany', code: 'DE' },
		{ name: 'Japan', code: 'JP' }
	]
	const fields = { text: 'name', value: 'code' }
	let value = $state(null)
</script>

<Select items={countries} {fields} bind:value placeholder="Select a country" />
