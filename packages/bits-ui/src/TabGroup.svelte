<script>
	import { Tabs } from 'bits-ui'
	import { equals, pick } from 'ramda'
	import { Proxy } from '@rokkit/states'
	import { id, defaultStateIcons } from '@rokkit/core'
	import { Icon } from '@rokkit/ui'

	/**
	 * @typedef {Object} TabGroupProps
	 * @property {string}                   [class]       - Additional CSS class names
	 * @property {any[]}                    [options]     - Array of options to display
	 * @property {any}                      [value]       - Selected value (bindable)
	 * @property {FieldMapping}             [fields]      - Field mappings for extracting data
	 * @property {'horizontal'|'vertical'}  [orientation] - Orientation of the tab bar
	 * @property {'before' | 'after' }      [position]    - Position of the tab bar
	 * @property {'start'|'center'|'end'}   [align]       - Alignment of the tab bar
	 * @property {boolean}                  [editable]    - Whether tabs can be added/removed
	 * @property {string}                   [placeholder] - Placeholder text for input field
	 * @property {number}                   [tabindex]    - Tabindex for keyboard navigation
	 * @property {import('svelte').Snippet} [child]       - Snippet for rendering individual items
	 * @property {import('svelte').Snippet} [children]    - Snippet for rendering content
	 * @property {import('svelte').Snippet} [empty]       - Snippet for rendering empty state
	 * @property {Function}                 [onselect]    - Callback when item is selected
	 * @property {Function}                 [onadd]       - Callback when tab is added
	 * @property {Function}                 [onremove]    - Callback when tab is removed
	 */
	/** @type TabGroupProps */
	let {
		options = [],
		value = $bindable(),
		fields,
		orientation = 'horizontal',
		align = 'start',
		position = 'before',
		placeholder = 'Select a tab to view its content.',
		editable = false,
		icons,
		child,
		children,
		empty,
		onchange,
		onadd,
		onremove
	} = $props()

	let tabOptions = $derived(options.map((option) => new Proxy(option, fields)))
	let initialValue = $state()
	let activeOption = $state()
	let childSnippet = $derived(child ?? defaultChild)
	let childrenSnippet = $derived(children ?? defaultChildren)
	let emptyMessage = $derived(empty ?? defaultEmpty)
	let tabIcons = $derived({ ...pick(['add', 'close'], defaultStateIcons.action), ...icons })

	$effect.pre(() => {
		activeOption = tabOptions.find((proxy) => equals(proxy.value, value))
		if (activeOption) initialValue = activeOption.id
	})

	function handleChange(newValue) {
		activeOption = tabOptions.find((proxy) => equals(proxy.id, newValue))
		value = activeOption?.value
		onchange?.(value)
	}
	function handleAdd() {
		onadd?.()
	}
	function handleRemove(item) {
		onremove?.(item)
	}
</script>

{#snippet defaultChild(item)}
	{item.get('text')}
{/snippet}
{#snippet defaultChildren(item)}
	{item.get('content')}
{/snippet}
{#snippet defaultEmpty()}
	{placeholder}
{/snippet}

<Tabs.Root
	onValueChange={handleChange}
	value={initialValue}
	{orientation}
	data-position={position}
	data-align={align}
>
	<Tabs.List>
		{#each tabOptions as tab (tab.id)}
			<Tabs.Trigger value={tab.id}>
				{@render childSnippet(tab)}
				{#if editable}
					<Icon
						data-icon-remove
						name={tabIcons.close}
						role="button"
						onclick={() => handleRemove(tab.value)}
					/>
				{/if}
			</Tabs.Trigger>
		{/each}
		{#if editable}
			<Icon data-icon-add name={tabIcons.add} role="button" onclick={handleAdd} />
		{/if}
	</Tabs.List>
	<div data-tabs-content>
		{#if tabOptions.length === 0}
			<div data-tabs-empty>
				{@render emptyMessage()}
			</div>
		{:else}
			{@render childrenSnippet()}
		{/if}
	</div>
</Tabs.Root>
