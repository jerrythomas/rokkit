<script>
	import { noop } from '@rokkit/core'
	/**
	 * @typedef {Object} Props
	 * @property {string} [label]
	 * @property {number} value
	 * @property {boolean} [selected]
	 * @property {boolean} [disabled]
	 * @property {Function} [onclick]
	 */

	/** @type {Props} */
	let { label = null, value, selected = false, disabled = false, onclick = noop } = $props()
	let text = $derived(label ?? value.toFixed(0))
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	data-range-tick
	{onclick}
	role="option"
	aria-selected={selected}
	aria-disabled={disabled}
	data-disabled={disabled}
	tabindex={disabled ? -1 : 0}
>
	<div data-tick-bar></div>
	<p data-tick-label>{text}</p>
</div>

<style>
	[data-range-tick] {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		cursor: pointer;
		user-select: none;
	}
	[data-tick-bar] {
		grid-column-start: 2;
		height: 5px;
		border-left-width: 1px;
	}
	[data-tick-label] {
		grid-column: span 2;
		display: flex;
		justify-content: center;
	}
	[data-range-tick][data-disabled='true'] {
		pointer-events: none;
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
