<script>
	let { component, class: className = '' } = $props()
</script>

<div class="story-component p-6 {className}">
	{#if component}
		{@const Component = component}
		<Component />
	{:else}
		<div
			class="text-surface-floating border-surface-300 rounded border border-dashed p-4 text-center"
		>
			<p>Component loading in progress...</p>
			<p class="mt-1 text-sm">If this persists, check console for errors</p>
		</div>
	{/if}
</div>
