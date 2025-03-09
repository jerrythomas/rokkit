<script>
	import { defaultStateIcons } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [id]
	 * @property {any} name
	 * @property {boolean} [value]
	 * @property {boolean} [readOnly]
	 * @property {any} [stateIcons]
	 * @property {number} [tabindex]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		id = null,
		name,
		value = $bindable(false),
		readOnly = false,
		stateIcons = defaultStateIcons.checkbox,
		tabindex = 0
	} = $props()

	let state = $derived(value === null ? 'unknown' : value ? 'checked' : 'unchecked')

	function toggle(event) {
		event.preventDefault()
		event.stopPropagation()
		value = !value
	}
	function handleClick(event) {
		if (!readOnly) toggle(event)
	}
	function handleKeydown(event) {
		if (readOnly) return
		if (event.key === 'Enter' || event.key === ' ') toggle(event)
	}
</script>

<rk-checkbox
	{id}
	class={classes}
	class:disabled={readOnly}
	role="checkbox"
	aria-checked={state}
	aria-disabled={readOnly}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{tabindex}
>
	<input hidden type="checkbox" {name} {readOnly} bind:checked={value} />

	<icon class={stateIcons[state]}></icon>
</rk-checkbox>
