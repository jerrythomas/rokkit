<script>
	import { equals } from 'ramda'
	import { defaultStateIcons } from '@rokkit/core'
	import { defaultMapping } from './constants'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} name
	 * @property {any} [id]
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {any} [options]
	 * @property {boolean} [disabled]
	 * @property {boolean} [readOnly]
	 * @property {boolean} [textAfter]
	 * @property {any} [stateIcons]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		value = $bindable(),
		name,
		id = null,
		mapping = $bindable(defaultMapping),
		options = [],
		disabled = false,
		readOnly = false,
		textAfter = true,
		stateIcons = defaultStateIcons.radio
	} = $props()

	let isDisabled = $derived(disabled || readOnly)
	let flexDirection = $derived(textAfter ? 'flex-row' : 'flex-row-reverse')
</script>

<div
	data-radio-group-root
	{id}
	class={className}
	role="radiogroup"
	aria-disabled={isDisabled}
	data-disabled={isDisabled}
>
	{#each options as item, index (index)}
		{@const label = mapping.get('text', item)}
		{@const itemValue = mapping.get('value', item, label)}
		{@const itemDisabled = mapping.get('disabled', item, false) || isDisabled}
		{@const state = equals(itemValue, value) ? 'on' : 'off'}

		<label
			data-radio-item
			class={flexDirection}
			data-state={state}
			data-disabled={itemDisabled}
			aria-disabled={itemDisabled}
		>
			<input
				hidden
				type="radio"
				{name}
				bind:group={value}
				value={itemValue}
				disabled={itemDisabled}
			/>
			<span data-radio-indicator>
				<icon class={stateIcons[state]} aria-hidden="true"></icon>
			</span>
			<span data-radio-label>{label}</span>
		</label>
	{/each}
</div>
