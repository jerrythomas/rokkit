<script>
	import { Toggle } from '@rokkit/ui'

	let options = ['Daily', 'Weekly', 'Monthly']
	let value = $state('Weekly')
</script>

<div class="space-y-4">
	<Toggle {options} bind:value />

	<p class="text-surface-z7">
		Selected: <strong>{value}</strong>
	</p>
</div>
