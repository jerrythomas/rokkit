<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	
	/**
	 * @typedef {Object} Props
	 * @property {date} value
	 */

	/** @type {Props & { [key: string]: any }} */
	let { value = $bindable(), ...rest } = $props();
</script>

<input bind:value type="date" {...rest} onchange={bubble('change')} onfocus={bubble('focus')} onblur={bubble('blur')} />
