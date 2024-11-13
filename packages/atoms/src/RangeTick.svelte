<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	/**
	 * @typedef {Object} Props
	 * @property {string} [label]
	 * @property {any} value
	 * @property {boolean} [selected]
	 */

	/** @type {Props} */
	let { label = '', value, selected = false } = $props()

	function handleClick() {
		dispatch('click', value)
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<tick
	class="grid grid-cols-2 cursor-pointer select-none"
	onclick={handleClick}
	role="option"
	aria-selected={selected}
	tabindex="0"
>
	<tick-bar class="col-start-2 h-5px border-l"></tick-bar>
	<p class="col-span-2 flex justify-center">
		{label}
	</p>
</tick>
