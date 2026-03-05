<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'

	const items = [
		{ text: 'Alpha', value: 'alpha' },
		{ text: 'Beta', value: 'beta' },
		{ text: 'Gamma', value: 'gamma' }
	]
	let value = $state([])
</script>

<MultiSelect {items} bind:value placeholder="Select values" />
