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
	class="grid cursor-pointer select-none grid-cols-2"
	onclick={handleClick}
	role="option"
	aria-selected={selected}
	tabindex="0"
>
	<tick-bar class="h-5px col-start-2 border-l"></tick-bar>
	<p class="col-span-2 flex justify-center">
		{label}
	</p>
</tick>
