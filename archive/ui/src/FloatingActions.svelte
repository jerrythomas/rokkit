<script>
	/** @type {import('./types.js').FloatingActionsProps} */
	let {
		class: className = '',
		position = 'bottom-right',
		open = $bindable(false),
		children,
		trigger
	} = $props()

	function handleToggle() {
		open = !open
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && open) {
			open = false
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div data-floating-actions data-position={position} data-open={open || undefined} class={className}>
	{#if open && children}
		<div data-floating-actions-menu role="menu">
			{@render children()}
		</div>
	{/if}

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<button
		data-floating-actions-trigger
		type="button"
		onclick={handleToggle}
		aria-expanded={open}
		aria-haspopup="menu"
		aria-label={open ? 'Close actions menu' : 'Open actions menu'}
	>
		{#if trigger}
			{@render trigger(open)}
		{:else}
			<span data-floating-actions-icon class:open>
				{open ? '×' : '+'}
			</span>
		{/if}
	</button>
</div>
