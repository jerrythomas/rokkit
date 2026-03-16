<script>
	/**
	 * Renders an array of objects as a responsive card grid.
	 * Each card displays fields with formatted values.
	 */
	import DisplayValue from './DisplayValue.svelte'
	import { SvelteSet } from 'svelte/reactivity'

	let { data = [], fields = [], select, title, onselect, class: className = '' } = $props()

	let selectedIndex = $state(-1)
	let selectedIndices = new SvelteSet()

	function selectOne(item, index) {
		selectedIndex = index
		onselect?.(item, item)
	}

	function selectMany(item, index) {
		const next = new SvelteSet(selectedIndices)
		if (next.has(index)) {
			next.delete(index)
		} else {
			next.add(index)
		}
		selectedIndices = next
		const selected = data.filter((_, i) => next.has(i))
		onselect?.(selected, item)
	}

	function handleCardClick(item, index) {
		if (!select) return
		if (select === 'one') selectOne(item, index)
		else if (select === 'many') selectMany(item, index)
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
