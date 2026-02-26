<script>
	import { defaultRenderers, resolveRenderer } from '../lib/renderers.js'
	import FormRenderer from '../FormRenderer.svelte'

	/**
	 * @typedef {Object} ArrayEditorProps
	 * @property {Array} [value] - The array value (bindable)
	 * @property {Function} [onchange] - Called with new array on any change
	 * @property {Object} [items] - JSON Schema for each array item (from schema.items)
	 * @property {boolean} [disabled]
	 * @property {boolean} [readonly]
	 */

	/** @type {ArrayEditorProps & { [key: string]: any }} */
	let {
		value = $bindable([]),
		onchange,
		items,
		disabled = false,
		readonly = false,
		..._rest
	} = $props()

	// Normalize: treat undefined/null as empty array
	const safeValue = $derived(Array.isArray(value) ? value : [])

	// Item schema — default to string if not provided
	const itemSchema = $derived(items ?? { type: 'string' })

	// Resolve the primitive renderer once (reused for all items)
	const PrimitiveComponent = $derived(
		itemSchema.type !== 'object'
			? resolveRenderer({ type: itemSchema.type }, defaultRenderers)
			: null
	)

	function typeDefault(type) {
		return { string: '', number: 0, integer: 0, boolean: false, array: [], object: {} }[type] ?? null
	}

	function createDefaultItem(schema) {
		if (schema.type === 'object') {
			return Object.fromEntries(
				Object.entries(schema.properties ?? {}).map(([k, s]) => [k, s.default ?? typeDefault(s.type)])
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

	function removeItem(index) {
		const newValue = safeValue.filter((_, i) => i !== index)
		value = newValue
		onchange?.(newValue)
	}

	function updateItem(index, newItemValue) {
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
							data={item}
							schema={itemSchema}
							onupdate={(newData) => updateItem(index, newData)}
						/>
					{:else}
						<PrimitiveComponent
							value={item}
							onchange={(newVal) => updateItem(index, newVal)}
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
						onclick={() => removeItem(index)}
					>Remove</button>
				{/if}
			</div>
		{/each}
	</div>
	{#if !readonly}
		<button type="button" data-array-editor-add {disabled} onclick={addItem}>Add</button>
	{/if}
</div>
