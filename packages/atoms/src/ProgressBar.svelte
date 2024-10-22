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
	let {
		class: className = '',
		value = null,
		max = null,
		height = '1.5mm',
		width = 10
	} = $props();

	let indeterminate = $derived(value === null || max === null)
	let percentage = $derived(indeterminate ? width : value / max)
</script>

<progress-bar class:indeterminate class="flex w-full {className}" style:height>
	<value-bar style:width="{percentage}%" style:height></value-bar>
</progress-bar>
