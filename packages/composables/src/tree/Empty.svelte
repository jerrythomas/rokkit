<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, ...rest } = $props()
</script>

<tree-empty {...rest} class={className} data-tree-empty>
	{@render children?.()}
</tree-empty>
