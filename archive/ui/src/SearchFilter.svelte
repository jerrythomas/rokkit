<script>
	import { FieldMapper } from '@rokkit/core'

	/** @type {import('./types.js').SearchFilterProps} */
	let {
		class: className = '',
		items = [],
		filtered = $bindable([]),
		fields = {},
		searchText = $bindable(''),
		placeholder = 'Search...',
		filterFn,
		caseSensitive = false,
		children
	} = $props()

	let fm = $derived(new FieldMapper(fields))

	/**
	 * Default filter function using text and keywords fields
	 * @param {any} item
	 * @param {string} text
	 * @returns {boolean}
	 */
	function defaultFilter(item, text) {
		const searchTerm = caseSensitive ? text : text.toLowerCase()

		// Check text field
		const textValue = fm.get('text', item)
		if (textValue) {
			const compareValue = caseSensitive ? String(textValue) : String(textValue).toLowerCase()
			if (compareValue.includes(searchTerm)) return true
		}

		// Check keywords field
		const keywords = fm.get('keywords', item)
		if (keywords) {
			const keywordStr = Array.isArray(keywords) ? keywords.join(' ') : String(keywords)
			const compareValue = caseSensitive ? keywordStr : keywordStr.toLowerCase()
			if (compareValue.includes(searchTerm)) return true
		}

		return false
	}

	let filter = $derived(filterFn || defaultFilter)

	let computedFiltered = $derived.by(() => {
		if (!searchText || searchText.trim() === '') {
			return items
		}
		return items.filter((item) => filter(item, searchText))
	})

	// Sync computed filtered to the bindable prop
	$effect(() => {
		filtered = computedFiltered
	})

	function handleClear() {
		searchText = ''
	}
</script>

<div data-search-filter class={className}>
	<div data-search-input-wrapper>
		<input
			data-search-input
			type="search"
			bind:value={searchText}
			{placeholder}
			aria-label={placeholder}
		/>
		{#if searchText}
			<button data-search-clear type="button" onclick={handleClear} aria-label="Clear search">
				×
			</button>
		{/if}
	</div>
	{#if children}
		{@render children()}
	{/if}
</div>
