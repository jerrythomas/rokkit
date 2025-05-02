<script>
	/**
	 * @typedef {Object} ButtonProps
	 * @property {'default' | 'primary' | 'secondary' | 'tertiary'} variant - The variant of the button.
	 * @property {'button' | 'submit' | 'reset'} type - The type of the button.
	 * @property {string} [label] - The label of the button.
	 * @property {string|import('svelte').Snippet} [leftIcon] - The left icon of the button.
	 * @property {string|import('svelte').Snippet} [rightIcon] - The right icon of the button.
	 * @property {import('svelte').Snippet} [children]
	 * @property {Function} onclick - The onclick event of the button.
	 * @property {Function} onsubmit - The onsubmit event of the button.
	 * @property {Function} onreset - The onreset event of the button.
	 */
	/** @type {ButtonProps} */
	let {
		variant = 'default',
		type = 'button',
		leftIcon = null,
		rightIcon = null,
		label = null,
		children = null,
		description = null,
		onclick,
		onsubmit,
		onreset
	} = $props()

	const primary = $derived(variant === 'primary')
	const secondary = $derived(variant === 'secondary')
	const tertiary = $derived(variant === 'tertiary')
</script>

<button
	class:primary
	class:secondary
	class:tertiary
	class={classes}
	{type}
	{onclick}
	{onsubmit}
	{onreset}
	aria-label={description ?? label}
>
	{#if typeof leftIcon === 'string'}
		<Icon name={leftIcon} />
	{:else}
		{@render leftIcon?.()}
	{/if}

	{#if children}
		{@render children()}
	{:else if label}
		{label}
	{/if}

	{#if typeof rightIcon === 'string'}
		<Icon name={rightIcon} />
	{:else}
		{@render rightIcon?.()}
	{/if}
</button>
