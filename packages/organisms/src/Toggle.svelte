<script>
	import { run } from 'svelte/legacy'

	import { defaultFields } from '@rokkit/core'
	import { switchable } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {[any,any]} [options]
	 * @property {any} [value]
	 * @property {any} [fields]
	 * @property {any} [using]
	 * @property {string} [description]
	 * @property {number} [tabindex]
	 * @property {boolean} [disabled]
	 * @property {boolean} [minimal]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		options = [false, true],
		value = $bindable(options[0]),
		fields = $bindable({}),
		using = $bindable({}),
		description = 'Toggle',
		tabindex = 0,
		disabled = false,
		minimal = false
	} = $props()

	function handle(e) {
		value = e.detail
		dispatch('change', value)
	}
	run(() => {
		fields = { ...defaultFields, ...fields }
	})
	run(() => {
		using = { default: Item, ...using }
	})
</script>

<toggle
	role="switch"
	class={className}
	aria-checked={value === options[1]}
	aria-label={description}
	aria-disabled={disabled}
	{tabindex}
	use:switchable={{ value, options, disabled }}
	onchange={handle}
	class:minimal
>
	<Item {value} {fields} />
</toggle>
