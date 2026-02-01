<script>
	import { defaultFields, createEmitter } from '@rokkit/core'
	import Select from './Select.svelte'
	import Item from './Item.svelte'

	/** @type {import('./types.js').MultiSelectProps} */
	let {
		class: className = '',
		name = 'multiselect',
		value = $bindable([]),
		options = $bindable([]),
		fields = {},
		placeholder = '',
		tabindex = 0,
		disabled = false,
		searchable = false,
		searchText = $bindable(''),
		searchPlaceholder = 'Search...',
		filterFn,
		onselect,
		onchange,
		onremove
	} = $props()

	let mergedFields = $derived({ ...defaultFields, ...fields })
	let available = $derived(options.filter((item) => !value.includes(item)))
	let emitter = createEmitter({ onchange, onselect, onremove }, ['select', 'change', 'remove'])

	function handleRemove(item) {
		value = value.filter((v) => v !== item)
		emitter.remove(item)
		emitter.change(value)
	}

	function handleSelect(selectedItem) {
		if (!value.includes(selectedItem)) {
			value = [...value, selectedItem]
			emitter.select(selectedItem)
			emitter.change(value)
		}
	}
</script>

<multi-select data-multiselect class={className} aria-label={name}>
	<Select
		{name}
		options={available}
		fields={mergedFields}
		onselect={handleSelect}
		class=""
		{placeholder}
		{tabindex}
		{disabled}
		{searchable}
		bind:searchText
		{searchPlaceholder}
		{filterFn}
	>
		{#snippet currentItem()}
			{#if value.length > 0}
				<items data-multiselect-items>
					{#each value as item, index (index)}
						<wrap-item data-multiselect-pill class="pill">
							<Item value={item} fields={mergedFields} />
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<icon
								role="button"
								tabindex="-1"
								data-multiselect-remove
								onclick={() => handleRemove(item)}
								aria-label="Remove"
							>
								×
							</icon>
						</wrap-item>
					{/each}
				</items>
			{:else}
				<item>{placeholder}</item>
			{/if}
		{/snippet}
	</Select>
</multi-select>
