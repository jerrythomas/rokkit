<script>
	import { run } from 'svelte/legacy';

	/**
	 * @typedef {Object} Props
	 * @property {any} x
	 * @property {any} y
	 * @property {any} text
	 * @property {number} [angle]
	 * @property {boolean} [small]
	 * @property {string} [anchor]
	 */

	/** @type {Props} */
	let {
		x,
		y,
		text,
		angle = 0,
		small = false,
		anchor = $bindable('middle')
	} = $props();

	let transform = $derived(`translate(${x},${y}) rotate(${angle})`)
	run(() => {
		anchor = ['start', 'middle', 'end'].includes(anchor) ? anchor : 'middle'
	});
</script>

<text class="label" class:small text-anchor={anchor} {transform}>{text}</text>
