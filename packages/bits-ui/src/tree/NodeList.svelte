<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, ...rest } = $props()
</script>

<tree-node-items {...rest} class={className} data-tree-node-items>
	{@render children?.()}
</tree-node-items>
