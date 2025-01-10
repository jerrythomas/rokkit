<script>
	import { FieldMapper } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {any}           value
	 * @property {FieldMapper}  mapping
	 * @property {Array<Object>} options
	 */
	let { value = $bindable(), mapping = new FieldMapper(), options = [], ...rest } = $props()
</script>

<select bind:value {...rest}>
	{#each options as option}
		<option value={mapping.getValue(option)}>{mapping.getText(option)}</option>
	{/each}
</select>
