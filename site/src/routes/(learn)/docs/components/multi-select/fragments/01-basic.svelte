<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'

	const items = [
		{ label: 'Alpha', value: 'alpha' },
		{ label: 'Beta', value: 'beta' },
		{ label: 'Gamma', value: 'gamma' }
	]
	let value = $state([])
</script>

<MultiSelect {items} bind:value placeholder="Select values" />
