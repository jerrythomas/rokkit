<script>
	import Icon from './Icon.svelte'

	/** @type {import('./types.js').FloatingActionProps} */
	let {
		class: className = '',
		icon,
		label = '',
		disabled = false,
		onclick,
		children
	} = $props()
</script>

<button
	data-floating-action
	type="button"
	class={className}
	{disabled}
	{onclick}
	role="menuitem"
	aria-label={label}
	title={label}
>
	{#if children}
		{@render children()}
	{:else if icon}
		<Icon name={icon} {label} />
	{/if}
	{#if label}
		<span data-floating-action-label>{label}</span>
	{/if}
</button>
