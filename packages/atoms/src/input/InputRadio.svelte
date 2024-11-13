<script>
	import { defaultFields, getValue, getText } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} [fields]
	 * @property {any} [options]
	 * @property {boolean} [readonly]
	 * @property {boolean} [flip]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: className = '',
		value = $bindable(),
		fields = $bindable(defaultFields),
		options = [],
		readonly = false,
		flip = false,
		...rest
	} = $props()

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
	})
	let flexDirection = $derived(flip ? 'flex-row-reverse' : 'flex-row')
</script>

<radio-group class={className} class:disabled={readonly}>
	{#each options as item}
		{@const itemValue = getValue(item, fields)}
		{@const label = getText(item, fields)}

		<label class="flex {flexDirection} items-center gap-2">
			<input type="radio" {...rest} bind:group={value} value={itemValue} readOnly={readonly} />
			<p>{label}</p>
		</label>
	{/each}
</radio-group>
