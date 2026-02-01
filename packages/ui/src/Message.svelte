<script>
	let { text = null, type = 'error', children } = $props()
</script>

<div data-message-root data-type={type} role="alert">
	{#if children}
		{@render children()}
	{:else}
		{text}
	{/if}
</div>
