<script>
	import { defaultFields, getValue, getText } from '@rokkit/core'

	let { value = $bindable(), fields = defaultFields, options = [], ...rest } = $props()
</script>

<select bind:value {...rest}>
	{#each options as option}
		<option value={getValue(option, fields)}>{getText(option, fields)}</option>
	{/each}
</select>
