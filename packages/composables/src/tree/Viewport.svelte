<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, ...rest } = $props()
</script>

<tree-viewport {...rest} class={className} data-tree-viewport>
	{@render children?.()}
</tree-viewport>
