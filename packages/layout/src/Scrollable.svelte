<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { class: className = '', children } = $props();
	
</script>

<scroll class="flex flex-col h-full overflow-scroll {className}">
	{@render children?.()}
</scroll>
