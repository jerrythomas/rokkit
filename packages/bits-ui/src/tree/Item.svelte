<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, ...rest } = $props()
</script>

<tree-item {...rest} class={className} data-tree-item>
	{@render children?.()}
</tree-item>
