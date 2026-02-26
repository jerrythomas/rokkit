<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	let options = ['Alpha', 'Beta', 'Gamma', 'Delta']
	let value = $state(null)
</script>

<Select {options} bind:value placeholder="Select a value" />

<div class="mt-4">
	<p><strong>Selected Value:</strong> <b>{value || 'None'}</b></p>
</div>