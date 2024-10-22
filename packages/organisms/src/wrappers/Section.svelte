<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [title]
	 * @property {boolean} [open]
	 * @property {string} [type]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		title = 'Section',
		open = $bindable(true),
		type = 'vertical',
		children
	} = $props();
</script>

<details bind:open class={className}>
	<summary>{title}</summary>
	<field-layout class={type}>
		{@render children?.()}
	</field-layout>
</details>
