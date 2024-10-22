<script>
	import { defaultFields, getComponent, hasChildren } from '@rokkit/core'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} SummaryProps
	 * @property {string|Object} value
	 * @property {Object} fields
	 * @property {Object} using
	 */
	let { value = $bindable(), fields = $bindable({}), using = $bindable({}) } = $props()

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
		using = { default: Item, ...using }
	})

	let hasItems = $derived(hasChildren(value, fields))
	let component = $derived(getComponent(value, fields, using))

	const SvelteComponent = $derived(component)
</script>

<summary class="w-full flex flex-shrink-0 flex-row cursor-pointer items-center" tabindex="-1">
	<SvelteComponent bind:value {fields} />
	{#if hasItems}
		{#if value[fields.isOpen]}
			<icon class="accordion-opened sm" aria-label="collapse"></icon>
		{:else}
			<icon class="accordion-closed sm" aria-label="expand"></icon>
		{/if}
	{/if}
</summary>
