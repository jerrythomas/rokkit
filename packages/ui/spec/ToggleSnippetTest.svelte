<script lang="ts">
	import Toggle from '../src/components/Toggle.svelte'
	import type { ToggleItem, ToggleFields, ToggleItemHandlers } from '../src/types/toggle.js'

	const {
		options = [],
		fields,
		value,
		onchange
	}: {
		options?: ToggleItem[]
		fields?: ToggleFields
		value?: unknown
		onchange?: (value: unknown, item: ToggleItem) => void
	} = $props()
</script>

<Toggle {options} {fields} {value} {onchange}>
	{#snippet item(toggleItem: ToggleItem, _itemFields: ToggleFields, handlers: ToggleItemHandlers, selected: boolean)}
		<button
			type="button"
			data-custom-toggle-item
			data-item-value={toggleItem.value}
			data-selected={selected || undefined}
			onclick={handlers.onclick}
			onkeydown={handlers.onkeydown}
		>
			Custom: {toggleItem.text}
		</button>
	{/snippet}
</Toggle>
