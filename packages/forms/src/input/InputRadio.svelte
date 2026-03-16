<script>
	import { getItemAtIndex, getIndexForItem, noop } from '@rokkit/core'
	import { ProxyItem } from '@rokkit/states'
	// import { equals } from 'ramda'
	/**
	 * @typedef {Object} InputRadioProps
	 * @property {string} [class]
	 * @property {any} value
	 * @property {Object} [fields]
	 * @property {any} [options]
	 * @property {boolean} [disabled]
	 * @property {boolean} [flip]
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 */

	/** @type {InputRadioProps & { [key: string]: any }} */
	let {
		class: className = '',
		value = $bindable(),
		fields,
		options = [],
		disabled = false,
		onchange = noop,
		onfocus,
		onblur,
		...rest
	} = $props()

	let currentIndex = $derived(getIndexForItem(options, value))

	const handleChange = () => {
		value = getItemAtIndex(options, currentIndex)
		onchange?.(value)
	}

	// $effect.pre(() => {
	// 	currentIndex = getIndexForItem(options, value)
	// })
</script>

<radio-group class={className} class:disabled>
	{#each options as item, index (index)}
		{@const proxy = new ProxyItem(item, fields)}
		<label class="flex flex-row items-center gap-2 rtl:flex-row-reverse">
			<input
				type="radio"
				{...rest}
				bind:group={currentIndex}
				value={index}
				{disabled}
				onchange={handleChange}
				{onfocus}
				{onblur}
			/>
			<p>{proxy.label}</p>
		</label>
	{/each}
</radio-group>
