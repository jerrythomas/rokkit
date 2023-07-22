<script>
	import { defaultFields, getValue, getText } from '@rokkit/core'
	export let name
	export let value
	export let fields = defaultFields
	export let options = []
</script>

<select {name} bind:value {...$$restProps}>
	{#each options as option}
		<option value={getValue(option, fields)}>{getText(option, fields)}</option>
	{/each}
</select>
