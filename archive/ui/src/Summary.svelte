<script>
	import Icon from './Icon.svelte'
	import Item from './Item.svelte'
	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {Object} [fields]
	 * @property {boolean} [expanded]
	 * @property {boolean} [hasChildren]
	 * @property {boolean} [disabled]
	 * @property {string} [path]
	 */

	/** @type {Props} */
	let {
		value,
		fields = {},
		expanded = false,
		hasChildren = false,
		disabled = false,
		path = ''
	} = $props()

	let stateName = $derived(expanded ? 'opened' : 'closed')
</script>

<div
	data-accordion-trigger
	data-path={path}
	role="button"
	tabindex="-1"
	aria-expanded={hasChildren ? expanded : undefined}
	aria-disabled={disabled}
	data-disabled={disabled}
>
	<Item {value} {fields} />
	{#if hasChildren}
		<span data-accordion-icon>
			<Icon
				name={expanded ? 'accordion-opened' : 'accordion-closed'}
				label={expanded ? 'collapse' : 'expand'}
				state={stateName}
				class="w-4"
				size="small"
			/>
		</span>
	{/if}
</div>
