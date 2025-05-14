<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, ...rest } = $props()
</script>

<tree-node-list {...rest} class={className} data-tree-node-list>
	{@render children?.()}
</tree-node-list>
