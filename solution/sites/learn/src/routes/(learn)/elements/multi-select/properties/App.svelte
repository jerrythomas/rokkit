<script>
	import { MultiSelect } from '@rokkit/ui'

	let options = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']
	let value = $state([])
</script>

<MultiSelect {options} bind:value placeholder="Select multiple values" />

<div class="mt-4">
	<p><strong>Selected Values:</strong></p>
	<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
</div>