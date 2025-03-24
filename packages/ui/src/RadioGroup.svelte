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
	 * @property {import('@rokkit/core).FieldMapper} [mapping]
	 * @property {any} [options]
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
		readOnly = false,
		textAfter = true,
		stateIcons = defaultStateIcons.radio
	} = $props()

	let flexDirection = $derived(textAfter ? 'flex-row' : 'flex-row-reverse')
</script>

<rk-radio-group
	{id}
	class="flex cursor-pointer select-none flex-col {className}"
	class:disabled={readOnly}
>
	{#each options as item}
		{@const label = mapping.get('text', item)}
		{@const itemValue = mapping.get('value', item, label)}

		{@const state = equals(itemValue, value) ? 'on' : 'off'}

		<label class="flex {flexDirection} items-center gap-2">
			<input hidden type="radio" {name} bind:group={value} value={itemValue} {readOnly} />
			<icon class={stateIcons[state]}></icon>
			<p>{label}</p>
		</label>
	{/each}
</rk-radio-group>
