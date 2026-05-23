<script lang="ts">
	import { MultiSelect } from '@rokkit/ui'

	const items = [
		{ label: 'Red', value: 'red' },
		{ label: 'Green', value: 'green' },
		{ label: 'Blue', value: 'blue' },
		{ label: 'Yellow', value: 'yellow' },
		{ label: 'Purple', value: 'purple' }
	]
	let value = $state<string[]>([])
</script>

<MultiSelect {items} bind:value placeholder="Select colors" />
