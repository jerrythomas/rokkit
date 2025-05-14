<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any[]} [items]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, nodeIcon, items = [], ...rest } = $props()
	let lines = []
	let hasChildren = $derived(Array.isArray(items) && items.length > 0)
</script>

<tree-node {...rest} class={className} data-tree-node>
	{#each lines as { type }, index (index)}
		<Line {type} />
	{/each}
	{#if hasChildren}
		{@render nodeIcon(expanded)}
	{/if}
	{@render children?.()}
</tree-node>
