<script lang="ts">
	import type { SearchFilterProps, FilterObject } from '../types/search-filter.js'
	import { parseFilters } from '@rokkit/data'
	import { messages } from '@rokkit/states'

	let {
		filters = $bindable([]),
		debounce: delay = 300,
		placeholder = 'Search...',
		columns: _columns,
		labels: userLabels = {},
		onfilter,
		class: className = '',
		size = 'md',
		tag: tagSnippet
	}: SearchFilterProps & { labels?: Record<string, string> } = $props()

	const labels = $derived({
		clear: messages.current.search_.clear,
		remove: messages.current.filter.remove,
		...userLabels
	})

	let inputText = $state('')
	let timer: ReturnType<typeof setTimeout> | undefined

	function handleInput() {
		clearTimeout(timer)
		timer = setTimeout(() => {
			filters = parseFilters(inputText)
			onfilter?.(filters)
		}, delay)
	}

	function removeFilter(index: number) {
		filters = filters.filter((_: FilterObject, i: number) => i !== index)
		onfilter?.(filters)
	}

	function clear() {
		inputText = ''
		filters = []
		onfilter?.(filters)
	}

	function formatFilter(filter: FilterObject): string {
		const col = filter.column ? `${filter.column} ${filter.operator} ` : ''
		const val = filter.value instanceof RegExp ? filter.value.source : String(filter.value)
		return `${col}${val}`
	}
</script>

<div data-search-filter data-size={size} class={className || undefined}>
	<div data-search-input-wrapper>
		<input
			type="search"
			data-search-input
			bind:value={inputText}
			oninput={handleInput}
			{placeholder}
		/>
		{#if inputText}
			<button data-search-clear onclick={clear} aria-label={labels.clear} type="button">
				&times;
			</button>
		{/if}
	</div>

	{#if filters.length > 0}
		<div data-search-tags>
			{#each filters as filter, i}
				{#if tagSnippet}
					{@render tagSnippet(filter, () => removeFilter(i))}
				{:else}
					<span data-search-tag>
						<span data-search-tag-text>{formatFilter(filter)}</span>
						<button
							data-search-tag-remove
							onclick={() => removeFilter(i)}
							aria-label={labels.remove}
							type="button"
						>&times;</button>
					</span>
				{/if}
			{/each}
		</div>
	{/if}
</div>
