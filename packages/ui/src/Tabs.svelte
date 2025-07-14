<script>
	import { createEmitter, getKeyFromPath } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { ListController } from '@rokkit/states'
	import { Proxy } from '@rokkit/states'
	import { has, equals } from 'ramda'

	/**
	 * @typedef {Object} FieldMapping
	 * @property {string} [id] - Field to use for item ID
	 * @property {string} [label] - Field to use for item label/text
	 * @property {string} [value] - Field to use for item value
	 * @property {string} [content] - Field to use for tab content
	 */

	/**
	 * @typedef {Object} TabProps
	 * @property {string}                   [class]       - Additional CSS class names
	 * @property {string}                   [name]        - Name for accessibility
	 * @property {any[]}                    [items]       - Array of tab items to display
	 * @property {FieldMapping}             [fields]      - Field mappings for extracting data
	 * @property {'horizontal'|'vertical'}  [orientation] - Orientation of the tab bar
	 * @property {'before' | 'after' }      [position]    - Position of the tab bar
	 * @property {'start'|'center'|'end'}   [align]       - Alignment of the tab bar
	 * @property {any}                      [value]       - Selected tab value (bindable)
	 * @property {number}                   [tabindex]    - Tab index for keyboard navigation
	 * @property {boolean}                  [editable]    - Whether tabs can be added/removed
	 * @property {string}                   [placeholder] - Placeholder text for input field
	 * @property {import('svelte').Snippet} [child]       - Snippet for rendering tab headers
	 * @property {import('svelte').Snippet} [children]    - Snippet for rendering tab content
	 * @property {import('svelte').Snippet} [empty]       - Snippet for rendering empty state
	 * @property {Function}                 [onselect]    - Callback when tab is selected
	 * @property {Function}                 [onchange]    - Callback when tab changes
	 * @property {Function}                 [onmove]      - Callback when focus moves
	 * @property {Function}                 [onadd]       - Callback when tab is added
	 * @property {Function}                 [onremove]    - Callback when tab is removed
	 */

	/** @type {TabProps} */
	let {
		class: classes = '',
		name = 'tabs',
		items = $bindable([]),
		fields = {},
		value = $bindable(null),
		orientation = 'horizontal',
		align = 'start',
		position = 'before',
		tabindex = 0,
		editable = false,
		child,
		children,
		empty,
		placeholder = 'Select a tab to view its content.',
		onselect,
		onchange,
		onmove,
		onadd,
		onremove,
		...snippets
	} = $props()

	/** @type {Proxy[]} */
	let proxyItems = $derived(items.map((item) => new Proxy(item, fields)))
	let childSnippet = $derived(child ?? defaultChild)
	let childrenSnippet = $derived(children ?? defaultChildren)
	let emptyMessage = $derived(empty ?? defaultEmpty)
	let activeItem = $derived(proxyItems.find((proxy) => equals(proxy.value, value)))

	function handleAction(event) {
		const { name, data } = event.detail

		if (has(name, emitter)) {
			value = data.value
			emitter[name](data)
		}
	}

	function handleAdd() {
		onadd?.()
	}

	function handleRemove(item) {
		onremove?.(item)
	}

	let emitter = createEmitter({ onchange, onmove, onselect }, ['select', 'change', 'move'])
	let wrapper = new ListController(items, value, fields, { multiSelect: false })
</script>

{#snippet defaultChild(item)}
	{item.get('text') || item.get('label') || item.get('name')}
{/snippet}

{#snippet defaultChildren(item)}
	<div data-tab-content-default>
		{item.get('content')}
	</div>
{/snippet}

{#snippet defaultEmpty()}
	No tabs available.
{/snippet}

<div
	data-tab-root
	data-tab-orientation={orientation}
	data-tab-position={position}
	data-tab-align={align}
	class={classes}
	role="tablist"
	aria-label={name}
	use:navigator={{ wrapper, orientation }}
	{tabindex}
	onaction={handleAction}
>
	<div data-tab-list>
		{#each proxyItems as item, index (item.id)}
			{@const isSelected = equals(item.value, value)}
			{@const isFocused = wrapper.focusedKey === item.id}
			<div 
				data-tab-item
				data-path={getKeyFromPath([index])}
				role="tab"
				aria-selected={isSelected}
				aria-controls="tab-panel-{item.id}"
				class:selected={isSelected}
				class:focused={isFocused}
			>
				{@render childSnippet(item)}
				{#if editable}
					<button 
						data-tab-remove 
						onclick={() => handleRemove(item)} 
						aria-label="Remove tab"
						type="button"
					>
						×
					</button>
				{/if}
			</div>
		{/each}
		{#if editable}
			<button 
				data-tab-add 
				onclick={handleAdd} 
				aria-label="Add tab"
				type="button"
			>
				+
			</button>
		{/if}
	</div>

	<!-- Tab Content -->
	<div data-tab-content role="tabpanel">
		{#if proxyItems.length === 0}
			<div data-tab-empty>
				{@render emptyMessage()}
			</div>
		{:else if activeItem}
			<div id="tab-panel-{activeItem.id}" aria-labelledby="tab-{activeItem.id}">
				{@render childrenSnippet(activeItem)}
			</div>
		{:else}
			<div data-tab-content-placeholder>
				{placeholder}
			</div>
		{/if}
	</div>
</div>