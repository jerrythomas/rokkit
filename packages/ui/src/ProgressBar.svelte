<script>
	import { isNil } from 'ramda'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [value]
	 * @property {any} [max]
	 * @property {string} [height]
	 */

	/** @type {Props} */
	let { class: classes = '', value = null, max = 100, height = '1.5mm' } = $props()

	let indeterminate = $derived(isNil(value) || isNil(max))
	let percentage = $derived(indeterminate ? '100%' : `${(value * 100) / max}%`)
</script>

<div
	data-progress-root
	class={classes}
	role="progressbar"
	aria-valuenow={indeterminate ? undefined : value}
	aria-valuemin={0}
	aria-valuemax={max}
	data-indeterminate={indeterminate}
	style:height
>
	<div data-progress-bar style:width={percentage}></div>
</div>
