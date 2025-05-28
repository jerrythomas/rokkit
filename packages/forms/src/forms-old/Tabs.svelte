<script>
	import { Tabs } from 'bits-ui'

	/**
	 * @typedef {Object} TabGroupProps
	 * @property {string}                   [class]      - Additional CSS class names
	 * @property {any[]}                    [options]      Array of options to display
	 * @property {FieldMapping}             [fields]     - Field mappings for extracting data
	 * @property {any}                      [value]      - Selected value (bindable)
	 * @property {number}                   [tabindex]   - Tabindex for keyboard navigation
	 * @property {import('svelte').Snippet} [child]      - Snippet for rendering individual items
	 * @property {import('svelte').Snippet} [children]     Snippet for rendering content
	 * @property {Function}                 [onselect]   - Callback when item is selected
	 */
	/** @type TabGroupProps */
	let { options = [], value = $bindable(), fields, child, children, onchange } = $props()

	// let selectedGroup = options.find
	let tabOptions = $derived(options.map((option) => new Proxy(option, fields)))
	let initialValue = $state()
	let activeOption = $state()
	let childSnippet = $derived(child ?? defaultChild)

	$effect.pre(() => {
		activeOption = tabOptions.find((proxy) => equals(proxy.value, value))
		if (activeOption) initialValue = activeOption.id
	})

	function handleChange() {
		activeOption = tabOptions.find((proxy) => equals(proxy.id, initialValue))
		value = activeOption?.value
		onchange?.(value)
		// value = data
		// onSelect?.(data)
	}
</script>

{#snippet defaultChild(item)}
	{item.get('text')}
{/snippet}

<Tabs.Root onValueChange={handleChange} bind:value={initialValue}>
	<Tabs.List>
		{#each tabOptions as tab (tab.id)}
			<Tabs.Trigger value={tab.id}>
				{@render childSnippet(tab)}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>

	<!-- {#each tabOptions as tab (tab.id)} -->
	<Tabs.Content>
		{@render children()}
		<!-- <ComparisonCharts {logs} groupBy={tab.value} {m} /> -->
	</Tabs.Content>
	<!-- {/each} -->
</Tabs.Root>
