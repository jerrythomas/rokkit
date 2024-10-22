<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [header]
	 * @property {import('svelte').Snippet} [children]
	 * @property {import('svelte').Snippet} [footer]
	 */

	/** @type {Props} */
	let { header, children, footer } = $props();
</script>

<aside class="sidebar flex flex-col">
	{@render header?.()}
	{@render children?.()}
	{@render footer?.()}
</aside>
