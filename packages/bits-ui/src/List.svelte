<script>
	import { Command } from 'bits-ui'
	import { Proxy } from '@rokkit/states'

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

	/** @type {Props} */
	let {
		class: classNames = '',
		items = $bindable([]),
		fields = {},
		value = $bindable(null),
		tabindex = 0,
		searchPlaceholder = 'Search for something...',
		searchable = false,
		child,
		empty,
		onselect
	} = $props()

	let proxyItems = $derived(items.map((item) => new Proxy(item, fields)))
	let itemSnippet = $derived(child ?? defaultChild)
	let emptyMessage = $derived(empty ?? defaultEmpty)

	function handleSelect(data) {
		console.log('selected', data)
	}
</script>

{#snippet defaultChild(item)}
	{item.get('text')}
{/snippet}

{#snippet defaultEmpty()}
	No results found.
{/snippet}

<Command.Root
	class="divide-border border-neutral-muted bg-neutral-base mx-auto my-auto flex h-full w-full cursor-pointer select-none flex-col divide-y self-start overflow-hidden rounded-md border"
>
	{#if searchable}
		<Command.Input
			placeholder={searchPlaceholder}
			class="focus-override h-input placeholder:text-foreground-alt/50 focus:outline-hidden bg-neutral-subtle inline-flex truncate border-none px-4  leading-loose  transition-colors focus:ring-0"
		/>
	{/if}
	<Command.List class="max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2">
		<Command.Viewport>
			<Command.Empty
				class="text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 "
			>
				{@render emptyMessage()}
			</Command.Empty>
			{#each proxyItems as item, index (item.id)}
				{@const keywords = item.get('keywords') ?? [item.get('text')]}
				{#if item.has('href')}
					<Command.LinkItem
						href={item.get('href')}
						value={item.id}
						{keywords}
						onSelect={handleSelect}
						class="rounded-button data-selected:bg-neutral-muted outline-hidden flex h-10  items-center gap-2 px-3 py-2.5 text-sm capitalize"
					>
						{@render itemSnippet(item)}
					</Command.LinkItem>
				{:else}
					<Command.Item
						value={item.id}
						{keywords}
						onSelect={handleSelect}
						class="rounded-button data-selected:bg-neutral-muted outline-hidden flex h-10  items-center gap-2 px-3 py-2.5 text-sm capitalize"
					>
						{@render itemSnippet(item)}
					</Command.Item>
				{/if}
			{/each}
		</Command.Viewport>
	</Command.List>
</Command.Root>
