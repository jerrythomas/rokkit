<script>
	import { isNil } from 'ramda'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [value]
	 * @property {any} [max]
	 * @property {string} [height]
	 * @property {number} [width]
	 */

	/** @type {Props} */
	let { class: classes = '', value = null, max = 100, height = '1.5mm' } = $props()

	let indeterminate = $derived(isNil(value) || isNil(max))
	let percentage = $derived(indeterminate ? '100%' : `${(value * 100) / max}%`)
</script>

<rk-progress class:indeterminate class={classes} style:height>
	<value-bar class="h-full" style:width={percentage}></value-bar>
</rk-progress>
