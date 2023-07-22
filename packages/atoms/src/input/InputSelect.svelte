<script>
	import { defaultFields, getValue, getText } from '@rokkit/core'

	export let value
	export let fields = defaultFields
	export let options = []
</script>

<select bind:value {...$$restProps} on:change on:focus on:blur>
	{#each options as option}
		<option value={getValue(option, fields)}>{getText(option, fields)}</option>
	{/each}
</select>
