<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, ...rest } = $props()
</script>

<tree-node-content {...rest} class={className} data-tree-node-content>
	{@render children?.()}
</tree-node-content>
