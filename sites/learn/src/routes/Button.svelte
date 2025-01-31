<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [label]
	 * @property {'default'|'primary'|'secondary'} [variant]
	 * @property {'submit'|'button'|'reset'|null|undefined} [type]
	 * @property {string} [style]
	 * @property {import('svelte').Snippet} [children]
	 * @property {function} [onclick]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		label = null,
		type = 'submit',
		variant = 'default',
		style = 'default',
		children,
		onclick = () => {}
	} = $props()

	let isPrimary = $derived(variant === 'primary')
	let isOutlined = $derived(style === 'outlined')
</script>

<button
	{type}
	class="flex flex-row items-center {className}"
	{onclick}
	class:is-primary={isPrimary}
	class:is-outlined={isOutlined}
>
	{#if children}
		{@render children()}
	{:else}
		<p>{label}</p>
	{/if}
</button>
