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
	 * @property {import('svelte').Snippet} [groupItem]      - Snippet for rendering empty state
	 * @property {Function}                 [onselect]   - Callback when item is selected
	 */

	/** @type {Props} */
	let {
		class: classNames = '',
		items = $bindable([]),
		fields = {},
		value = $bindable(null),
		searchPlaceholder = 'Search for something...',
		searchable = false,
		showSeparator = false,
		disablePointerSelection = true,
		child,
		empty,
		groupItem,
		onSelect
	} = $props()

	/** @type {Command.Root} */
	let command = null
	/** @type {Proxy[]} */
	let proxyItems = $derived(items.map((item) => new Proxy(item, fields)))
	let itemSnippet = $derived(child ?? defaultChild)
	let groupSnippet = $derived(groupItem ?? defaultChild)
	let emptyMessage = $derived(empty ?? defaultEmpty)
	let currentValue = $state(null)

	$effect.pre(() => {
		let current = null
		for (let i = 0; i < proxyItems.length && current === null; i++) {
			const children = proxyItems[i].get('children')
			current = children.find((proxy) => equals(proxy.value, value))
			if (current) currentValue = current.id
		}
		console.log('Selected item:', currentValue)
	})
	function handleSelect(item) {
		currentValue = item.id
		value = item.value
		console.log('Selected item:', currentValue)
		onSelect?.(value)
	}
</script>

{#snippet defaultChild(item)}
	{item.get('text')}
{/snippet}

{#snippet defaultEmpty()}
	No results found.
{/snippet}

<Command.Root
	class={classNames}
	bind:this={command}
	bind:value={currentValue}
	{disablePointerSelection}
>
	{#if searchable}
		<Command.Input placeholder={searchPlaceholder} />
	{/if}
	<Command.List>
		<Command.Viewport>
			<Command.Empty>
				{@render emptyMessage()}
			</Command.Empty>
			<Command.Group>
				{#each proxyItems as group, index (group.id)}
					{#if index > 0 && showSeparator}
						<Command.Separator></Command.Separator>
					{/if}
					<Command.GroupHeading>
						{@render groupSnippet(group)}
					</Command.GroupHeading>
					<Command.GroupItems>
						{#each group.children as item (item.id)}
							{@const keywords = item.get('keywords') ?? [item.get('text')]}
							{#if item.has('href')}
								<Command.LinkItem
									data-current={item.id === currentValue}
									href={item.get('href')}
									value={item.id}
									{keywords}
									onSelect={() => handleSelect(item)}
								>
									{@render itemSnippet(item)}
								</Command.LinkItem>
							{:else}
								<Command.Item
									data-current={item.id === currentValue}
									value={item.id}
									{keywords}
									onSelect={() => handleSelect(item)}
								>
									{@render itemSnippet(item)}
								</Command.Item>
							{/if}
						{/each}
					</Command.GroupItems>
				{/each}
			</Command.Group>
		</Command.Viewport>
	</Command.List>
</Command.Root>
