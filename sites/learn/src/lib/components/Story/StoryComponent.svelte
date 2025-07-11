<script>
	/**
	 * @typedef {Object} StoryComponentProps
	 * @property {any} component - The Svelte component to render
	 * @property {string} [class] - Additional CSS classes
	 */

	/**
	 * Props for the StoryComponent
	 * @type {StoryComponentProps}
	 */
	let { component, class: className = '' } = $props()
</script>

<div class="story-component p-6 {className}">
	{#if component}
		{@const Component = component}
		<Component />
	{:else}
		<div class="text-neutral-floating p-4 border border-dashed border-neutral-300 rounded text-center">
			<p>Component loading in progress...</p>
			<p class="text-sm mt-1">If this persists, check console for errors</p>
		</div>
	{/if}
</div>
