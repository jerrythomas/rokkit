<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { class: className = '', children } = $props()
</script>

<scroll class="flex h-full flex-col overflow-scroll {className}">
	{@render children?.()}
</scroll>
