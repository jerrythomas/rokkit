<script>
	import { noop } from '@rokkit/core'
	/**
	 * @typedef {Object} Props
	 * @property {string} [label]
	 * @property {number} value
	 * @property {boolean} [selected]
	 * @property {Function} [onclick]
	 */

	/** @type {Props} */
	let { label = null, value, selected = false, onclick = noop } = $props()
	let text = $derived(label ?? value.toFixed(0))
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<rk-tick
	class="grid cursor-pointer select-none grid-cols-2"
	{onclick}
	role="option"
	aria-selected={selected}
	tabindex="0"
>
	<rk-tick-bar class="h-5px col-start-2 border-l"></rk-tick-bar>
	<p class="col-span-2 flex justify-center">
		{text}
	</p>
</rk-tick>
