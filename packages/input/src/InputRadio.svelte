<script>
	import { defaultFields, getValue, getText } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} [fields]
	 * @property {any} [options]
	 * @property {boolean} [disabled]
	 * @property {boolean} [flip]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: className = '',
		value = $bindable(),
		fields = $bindable(defaultFields),
		options = [],
		disabled = false,
		rtl = false,
		...rest
	} = $props()

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
	})
	// let flexDirection = $derived(flip ? 'flex-row-reverse' : 'flex-row')
</script>

<radio-group class={className} class:disabled>
	{#each options as item}
		{@const itemValue = getValue(item, fields)}
		{@const label = getText(item, fields)}

		<label class="flex items-center gap-2" class:flex-row={!rtl} class:flex-row-reverse={rtl}>
			<input type="radio" {...rest} bind:group={value} value={itemValue} {disabled} />
			<p>{label}</p>
		</label>
	{/each}
</radio-group>
