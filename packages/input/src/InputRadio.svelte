<script>
	import { FieldMapper } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} [mapping]
	 * @property {any} [options]
	 * @property {boolean} [disabled]
	 * @property {boolean} [flip]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: className = '',
		value = $bindable(),
		mapping = new FieldMapper(),
		options = [],
		disabled = false,
		rtl = false,
		...rest
	} = $props()
</script>

<radio-group class={className} class:disabled>
	{#each options as item}
		{@const itemValue = mapping.getValue(item)}
		{@const label = mapping.getText(item)}

		<label class="flex items-center gap-2" class:flex-row={!rtl} class:flex-row-reverse={rtl}>
			<input type="radio" {...rest} bind:group={value} value={itemValue} {disabled} />
			<p>{label}</p>
		</label>
	{/each}
</radio-group>
