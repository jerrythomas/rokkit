<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [value]
	 * @property {any} [max]
	 * @property {string} [height]
	 * @property {number} [width]
	 */

	/** @type {Props} */
	let { class: className = '', value = 0, max = 100, height = '1.5mm', width = 10 } = $props()

	let indeterminate = $derived(value === null || max === null)
	let percentage = $derived(indeterminate ? width : (value * 100) / max)
</script>

<rk-progress class:indeterminate class={className} style:height>
	<value-bar style:width="{percentage}%" style:height></value-bar>
</rk-progress>
