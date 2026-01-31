<script>
	import { Command } from 'bits-ui'
	import { Proxy } from '@rokkit/states'
	import { equals } from 'ramda'

	/**
	 * @typedef {Object} FieldMapping
	 * @property {string} [id] - Field to use for item ID
	 * @property {string} [label] - Field to use for item label/text
	 * @property {string} [value] - Field to use for item value
	 */

	/**
	 * @typedef {Object} ListProps
	 * @property {string}                   [class]      - Additional CSS class names
	 * @property {any[]}                    [items]      - Array of items to display
	 * @property {FieldMapping}             [fields]     - Field mappings for extracting data
	 * @property {any}                      [value]      - Selected value (bindable)
	 * @property {number}                   [tabindex]   - Tabindex for keyboard navigation
	 * @property {string}                   [searchPlaceholder] - Placeholder text for search input
	 * @property {boolean}                  [searchable] - Whether to show search input
	 * @property {import('svelte').Snippet} [child]      - Snippet for rendering individual items
	 * @property {import('svelte').Snippet} [empty]      - Snippet for rendering empty state
	 * @property {Function}                 [onselect]   - Callback when item is selected
	 */

	/** @type {ListProps} */
	let {
		class: classNames = '',
		items = $bindable([]),
		fields = {},
		value = $bindable(null),
		searchPlaceholder = 'Search for something...',
		searchable = false,
		child,
		empty,
		onselect
	} = $props()

	// /** @type {Command.Root} */
	// let command = null
	/** @type {Proxy[]} */
	let proxyItems = $derived(items.map((item) => new Proxy(item, fields)))
	let childSnippet = $derived(child ?? defaultChild)
	let emptyMessage = $derived(empty ?? defaultEmpty)
	let initialValue = $state()

	$effect.pre(() => {
		const current = proxyItems.find((proxy) => equals(proxy.value, value))
		if (current) initialValue = current.id
	})

	function handleSelect(data) {
		value = data
		onselect?.(data)
	}
</script>

{#snippet defaultChild(item)}
	{item.get('text')}
{/snippet}

{#snippet defaultEmpty()}
	No results found.
{/snippet}

<Command.Root class={classNames} bind:this={command} value={initialValue}>
	{#if searchable}
		<Command.Input placeholder={searchPlaceholder} />
	{/if}
	<Command.List>
		<Command.Viewport>
			<Command.Empty>
				{@render emptyMessage()}
			</Command.Empty>
			{#each proxyItems as item (item.id)}
				{@const keywords = item.get('keywords') ?? [item.get('text')]}
				{#if item.has('href')}
					<Command.LinkItem
						href={item.get('href')}
						value={item.id}
						{keywords}
						onSelect={() => handleSelect(item.value)}
					>
						{@render childSnippet(item)}
					</Command.LinkItem>
				{:else}
					<Command.Item value={item.id} {keywords} onSelect={() => handleSelect(item.value)}>
						{@render childSnippet(item)}
					</Command.Item>
				{/if}
			{/each}
		</Command.Viewport>
	</Command.List>
</Command.Root>
