<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [type]
	 * @property {string} [title]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { class: className = '', type = 'vertical', title = '', children } = $props()
</script>

<field-layout class="{type} {className}" aria-label={title}>
	{@render children?.()}
</field-layout>
