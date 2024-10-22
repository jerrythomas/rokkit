<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {boolean} [vertical]
	 * @property {import('svelte').Snippet} [nav]
	 * @property {import('svelte').Snippet} [content]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		vertical = false,
		nav,
		content
	} = $props();
</script>

<nav-content class="flex w-full h-full {className}" class:flex-col={vertical}>
	{@render nav?.()}
	{@render content?.()}
</nav-content>
