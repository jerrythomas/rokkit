<script>
	import Item from './Item.svelte'
	/**
	 * @typedef {Object} Props
	 * @property {import('@rokkit/states').NodeProxy} value
	 * @property {boolean} [expanded]
	 */

	/** @type {Props} */
	let { value = $bindable(), fields, expanded = false, hasChildren = false } = $props()
</script>

<rk-summary class="flex w-full flex-shrink-0 cursor-pointer flex-row items-center" tabindex="-1">
	<Item bind:value {fields} />
	{#if hasChildren}
		{#if expanded}
			<icon class="accordion-opened sm" aria-label="collapse"></icon>
		{:else}
			<icon class="accordion-closed sm" aria-label="expand"></icon>
		{/if}
	{/if}
</rk-summary>
