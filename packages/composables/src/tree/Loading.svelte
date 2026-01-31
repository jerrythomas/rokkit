<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = 'm-auto p-4 text-center text-gray-500', children, ...rest } = $props()
</script>

<tree-loading {...rest} class={className} data-tree-loading>
	{@render children?.()}
</tree-loading>
