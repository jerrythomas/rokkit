<script>
	/**
	 * Renders an array of objects as a responsive card grid.
	 * Each card displays fields with formatted values.
	 */
	import DisplayValue from './DisplayValue.svelte'

	let { data = [], fields = [], select, title, onselect, class: className = '' } = $props()

	let selectedIndex = $state(-1)
	let selectedIndices = $state(new Set())

	function handleCardClick(item, index) {
		if (!select) return

		if (select === 'one') {
			selectedIndex = index
			onselect?.(item, item)
		} else if (select === 'many') {
			const next = new Set(selectedIndices)
			if (next.has(index)) {
				next.delete(index)
			} else {
				next.add(index)
			}
			selectedIndices = next
			const selected = data.filter((_, i) => next.has(i))
			onselect?.(selected, item)
		}
	}

	function isSelected(index) {
		if (select === 'one') return selectedIndex === index
		if (select === 'many') return selectedIndices.has(index)
		return false
	}
</script>

<div data-display-cards data-selectable={select || undefined} class={className}>
	{#if title}
		<div data-display-title>{title}</div>
	{/if}
	<div data-display-grid>
		{#each data as item, index (index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				data-display-card
				data-selected={isSelected(index) || undefined}
				onclick={select ? () => handleCardClick(item, index) : undefined}
			>
				{#each fields as field (field.key)}
					<div data-display-field>
						<span data-display-label>{field.label ?? field.key}</span>
						<DisplayValue value={item[field.key]} format={field.format} />
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
