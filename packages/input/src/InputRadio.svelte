<script>
	import { FieldMapper, getItemAtIndex, getIndexForItem, noop } from '@rokkit/core'
	import { equals } from 'ramda'
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
		onchange = noop,
		...rest
	} = $props()

	const handleChange = (event) => {
		value = getItemAtIndex(options, currentIndex)
		onchange(value)
	}

	let currentIndex = $state(null)

	$effect.pre(() => {
		currentIndex = getIndexForItem(options, value)
	})
</script>

<radio-group class={className} class:disabled>
	{#each options as item, index}
		<label class="flex flex-row items-center gap-2 rtl:flex-row-reverse">
			<input
				type="radio"
				{...rest}
				bind:group={currentIndex}
				value={index}
				{disabled}
				onchange={handleChange}
			/>
			<p>{mapping.getText(item)}</p>
		</label>
	{/each}
</radio-group>
