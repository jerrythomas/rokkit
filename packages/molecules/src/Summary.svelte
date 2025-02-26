<script>
	import { defaultMapping } from './constants'

	/**
	 * @typedef {Object} SummaryProps
	 * @property {string|Object} value
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {boolean} [expanded]
	 * @property {Object} using
	 */
	let { value = $bindable(), mapping = defaultMapping, expanded = false } = $props()

	const Template = $derived(mapping.getComponent(value))
</script>

<rk-summary class="flex w-full flex-shrink-0 cursor-pointer flex-row items-center" tabindex="-1">
	<Template bind:value {mapping} />
	{#if mapping.hasChildren(value)}
		{#if expanded}
			<icon class="accordion-opened sm" aria-label="collapse"></icon>
		{:else}
			<icon class="accordion-closed sm" aria-label="expand"></icon>
		{/if}
	{/if}
</rk-summary>
