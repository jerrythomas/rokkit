<script>
	/**
	 * @typedef {Object} DemoComponentProps
	 * @property {any} component - The Svelte component to render
	 * @property {string} [class] - Additional CSS classes
	 */

	/**
	 * Props for the DemoComponent
	 * @type {DemoComponentProps}
	 */
	let {
		component,
		class: className = ''
	} = $props()
</script>

<div class="demo-component p-6 {className}">
	{#if component}
		{@const Component = component}
		<Component />
	{:else}
		<div class="text-neutral-floating">No component provided</div>
	{/if}
</div>
