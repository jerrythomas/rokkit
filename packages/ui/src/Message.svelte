<script>
	let { text = null, type = 'error', children } = $props()
</script>

<rk-message class={type}>
	{#if children}
		{@render children()}
	{:else}
		{text}
	{/if}
</rk-message>
