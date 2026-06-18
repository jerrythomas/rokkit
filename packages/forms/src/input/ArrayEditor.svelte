<script lang="ts">
	import { defaultRenderers, resolveRenderer } from '../lib/renderers.js'
	import FormRenderer from '../FormRenderer.svelte'

	type ItemSchema = {
		type?: string
		default?: unknown
		properties?: Record<string, ItemSchema>
	}

	type Props = {
		value?: unknown[]
		onchange?: (value: unknown[]) => void
		items?: ItemSchema
		disabled?: boolean
		readonly?: boolean
	}

	let {
		value = $bindable([]),
		onchange,
		items,
		disabled = false,
		readonly = false,
		..._rest
	}: Props = $props()

	// Normalize: treat undefined/null as empty array
	const safeValue = $derived(Array.isArray(value) ? value : [])

	// Narrow a dynamic array item into a record for object-schema rendering
	function toRecord(item: unknown): Record<string, unknown> {
		return item !== null && typeof item === 'object' && !Array.isArray(item)
			? (item as Record<string, unknown>)
			: {}
	}

	// Item schema — default to string if not provided
	const itemSchema = $derived<ItemSchema>(items ?? { type: 'string' })

	// Resolve the primitive renderer once (reused for all items)
	const PrimitiveComponent = $derived(
		itemSchema.type !== 'object'
			? resolveRenderer({ type: itemSchema.type ?? 'string' }, defaultRenderers)
			: null
	)

	const TYPE_DEFAULTS: Record<string, unknown> = {
		string: '',
		number: 0,
		integer: 0,
		boolean: false,
		array: [],
		object: {}
	}

	function typeDefault(type: string | undefined): unknown {
		return TYPE_DEFAULTS[type ?? ''] ?? null
	}

	function createDefaultItem(schema: ItemSchema): unknown {
		if (schema.type === 'object') {
			return Object.fromEntries(
				Object.entries(schema.properties ?? {}).map(([k, s]) => [
					k,
					s.default ?? typeDefault(s.type)
				])
			)
		}
		return schema.default ?? typeDefault(schema.type)
	}

	function addItem() {
		const newItem = createDefaultItem(itemSchema)
		const newValue = [...safeValue, newItem]
		value = newValue
		onchange?.(newValue)
	}

	function removeItem(index: number) {
		const newValue = safeValue.filter((_, i) => i !== index)
		value = newValue
		onchange?.(newValue)
	}

	function updateItem(index: number, newItemValue: unknown) {
		const newValue = safeValue.map((item, i) => (i === index ? newItemValue : item))
		value = newValue
		onchange?.(newValue)
	}
</script>

<div
	data-array-editor
	data-array-editor-empty={safeValue.length === 0 || undefined}
	data-array-editor-disabled={disabled || undefined}
>
	<div data-array-editor-items>
		{#each safeValue as item, index (index)}
			<div data-array-editor-item>
				<div data-array-editor-item-content>
					{#if itemSchema.type === 'object'}
						<FormRenderer
							data={toRecord(item)}
							schema={itemSchema}
							onupdate={(newData) => updateItem(index, newData)}
						/>
					{:else if PrimitiveComponent}
						<PrimitiveComponent
							value={item}
							onchange={(newVal: unknown) => updateItem(index, newVal)}
							{disabled}
							{readonly}
						/>
					{/if}
				</div>
				{#if !readonly}
					<button
						type="button"
						data-array-editor-remove
						{disabled}
						onclick={() => removeItem(index)}>Remove</button
					>
				{/if}
			</div>
		{/each}
	</div>
	{#if !readonly}
		<button type="button" data-array-editor-add {disabled} onclick={addItem}>Add</button>
	{/if}
</div>
