<script>
	/** @type {import('./types.js').PanelProps} */
	let {
		class: className = '',
		header,
		body,
		footer,
		children
	} = $props()
</script>

<div data-panel class={className}>
	{#if header}
		<div data-panel-header>
			{@render header()}
		</div>
	{/if}

	<div data-panel-body>
		{#if body}
			{@render body()}
		{:else if children}
			{@render children()}
		{/if}
	</div>

	{#if footer}
		<div data-panel-footer>
			{@render footer()}
		</div>
	{/if}
</div>
