<script>
	import { Command } from 'bits-ui'
	import { Proxy } from '@rokkit/states'
	import { equals } from 'ramda'

	/**
	 * @typedef {Object} FieldMapping
	 * @property {string} [id] - Field to use for item ID
	 * @property {string} [label] - Field to use for item label/text
	 * @property {string} [value] - Field to use for item value
	 * @property {string} [content] - Field to use for tab content
	 */

	/**
	 * @typedef {Object} TabProps
	 * @property {string}                   [class]      - Additional CSS class names
	 * @property {any[]}                    [items]      - Array of tab items to display
	 * @property {FieldMapping}             [fields]     - Field mappings for extracting data
	 * @property {any}                      [value]      - Selected tab value (bindable)
	 * @property {boolean}                  [editable]   - Whether tabs can be added/removed
	 * @property {import('svelte').Snippet} [child]      - Snippet for rendering tab headers
	 * @property {import('svelte').Snippet} [children]   - Snippet for rendering tab content
	 * @property {import('svelte').Snippet} [empty]      - Snippet for rendering empty state
	 * @property {Function}                 [onselect]   - Callback when tab is selected
	 * @property {Function}                 [onadd]      - Callback when tab is added
	 * @property {Function}                 [onremove]   - Callback when tab is removed
	 */

	/** @type {TabProps} */
	let {
		class: classNames = '',
		items = $bindable([]),
		fields = {},
		value = $bindable(null),
		editable = false,
		child,
		children,
		empty,
		onselect,
		onadd,
		onremove
	} = $props()

	/** @type {Proxy[]} */
	let proxyItems = $derived(items.map((item) => new Proxy(item, fields)))
	let childSnippet = $derived(child ?? defaultChild)
	let childrenSnippet = $derived(children ?? defaultChildren)
	let emptyMessage = $derived(empty ?? defaultEmpty)
	let initialValue = $state(null)
	let activeItem = $derived(proxyItems.find((proxy) => equals(proxy.value, value)))

	$effect.pre(() => {
		const current = proxyItems.find((proxy) => equals(proxy.value, value))
		if (current) initialValue = current.id
	})

	function handleChange(data) {
		activeItem = proxyItems.find((proxy) => equals(proxy.id, data))
		onselect?.(activeItem.value)
	}

	function handleAdd() {
		onadd?.()
	}

	function handleRemove(item) {
		onremove?.(item)
	}
</script>

{#snippet defaultChild(item)}
	{item.get('text') || item.get('label') || item.get('name')}
{/snippet}

{#snippet defaultChildren(item)}
	<div data-tab-content-default>
		{item?.get('content') || 'No content available'}
	</div>
{/snippet}

{#snippet defaultEmpty()}
	No tabs available.
{/snippet}

<div data-tab-root class="w-full {classNames}">
	<!-- Tab Headers -->
	<Command.Root
		onValueChange={handleChange}
		class="w-full"
		orientation="horizontal"
		value={initialValue}
		data-tabs-root
	>
		<Command.List data-tab-list class="flex">
			{#each proxyItems as item (item.id)}
				{@const keywords = item.get('keywords') ?? [
					item.get('text') || item.get('label') || item.get('name')
				]}
				<Command.Item
					value={item.id}
					{keywords}
					onSelect={() => handleSelect(item)}
					data-tab-item
					class="flex items-center"
				>
					{@render childSnippet(item)}
					{#if editable}
						<button data-tab-remove onclick={() => handleRemove(item)} aria-label="Remove tab">
							×
						</button>
					{/if}
				</Command.Item>
			{/each}
			{#if editable}
				<button data-tab-add onclick={handleAdd} aria-label="Add tab"> + </button>
			{/if}
		</Command.List>
	</Command.Root>

	<!-- Tab Content -->
	<div data-tab-content class="min-h-0 flex-1">
		{#if proxyItems.length === 0}
			<div data-tab-empty>
				{@render emptyMessage()}
			</div>
		{:else if activeItem}
			{@render childrenSnippet(activeItem)}
		{:else}
			<div data-tab-content-placeholder>Select a tab to view its content.</div>
		{/if}
	</div>
</div>
