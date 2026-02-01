<script>
	import Item from './Item.svelte'
	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {Object} [fields]
	 * @property {boolean} [expanded]
	 * @property {boolean} [hasChildren]
	 * @property {boolean} [disabled]
	 */

	/** @type {Props} */
	let { value, fields = {}, expanded = false, hasChildren = false, disabled = false } = $props()
</script>

<div
	data-accordion-trigger
	role="button"
	tabindex="-1"
	aria-expanded={hasChildren ? expanded : undefined}
	aria-disabled={disabled}
	data-disabled={disabled}
>
	<Item {value} {fields} />
	{#if hasChildren}
		<span data-accordion-icon>
			{#if expanded}
				<icon class="accordion-opened sm" aria-hidden="true"></icon>
			{:else}
				<icon class="accordion-closed sm" aria-hidden="true"></icon>
			{/if}
		</span>
	{/if}
</div>
