<script>
	import { createEmitter, getKeyFromPath, defaultStateIcons } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { ListController } from '@rokkit/states'
	import { Proxy } from '@rokkit/states'
	import { has, equals, pick } from 'ramda'
	import Icon from './Icon.svelte'

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
	 * @property {any[]}                    [options]       - Array of tab options to display
	 * @property {FieldMapping}             [fields]      - Field mappings for extracting data
	 * @property {'horizontal'|'vertical'}  [orientation] - Orientation of the tab bar
	 * @property {'before' | 'after' }      [position]    - Position of the tab bar
	 * @property {'start'|'center'|'end'}   [align]       - Alignment of the tab bar
	 * @property {any}                      [value]       - Selected tab value (bindable)
	 * @property {number}                   [tabindex]    - Tab index for keyboard navigation
	 * @property {boolean}                  [editable]    - Whether tabs can be added/removed
	 * @property {string}                   [placeholder] - Placeholder text for input field
	 * @property {import('svelte').Snippet} [tabItem]       - Snippet for rendering tab headers
	 * @property {import('svelte').Snippet} [tabPanel]    - Snippet for rendering tab content
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
		options = $bindable([]),
		fields = {},
		value = $bindable(),
		orientation = 'horizontal',
		align = 'start',
		position = 'before',
		tabindex = 0,
		editable = false,
		tabItem,
		tabPanel,
		empty,
		placeholder = 'Select a tab to view its content.',
		icons,
		onselect,
		onchange,
		onmove,
		onadd,
		onremove,
		...restProps
	} = $props()

	/** @type {Proxy[]} */
	let proxyItems = $derived(options.map((item) => new Proxy(item, fields)))
	let tabItemSnippet = $derived(tabItem ?? defaultItem)
	let tabPanelSnippet = $derived(tabPanel ?? defaultPanel)
	let emptyMessage = $derived(empty ?? defaultEmpty)

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
	let tabIcons = $derived({ ...pick(['add', 'close'], defaultStateIcons.action), ...icons })
	let emitter = $derived(
		createEmitter({ onchange, onmove, onselect }, ['select', 'change', 'move'])
	)
	let wrapper = new ListController(options, value, fields)

	$effect(() => wrapper.update(options))
</script>

{#snippet defaultItem(item)}
	{item.get('text') || item.get('label') || item.get('name')}
{/snippet}

{#snippet defaultPanel(item)}
	<div data-tabs-content>
		{item.get('content')}
	</div>
{/snippet}

{#snippet defaultEmpty()}
	No tabs available.
{/snippet}

<div
	{...restProps}
	data-tabs-root
	data-orientation={orientation}
	data-position={position}
	data-align={align}
	class={classes}
	role="tablist"
	aria-label={name}
	use:navigator={{ wrapper, orientation }}
	{tabindex}
	onaction={handleAction}
>
	{#if proxyItems.length === 0}
		<div data-tabs-empty>
			{@render emptyMessage()}
		</div>
	{:else if wrapper.focusedKey === null && value === null}
		<div data-tabs-placeholder>
			{placeholder}
		</div>
	{/if}
	<div data-tabs-list>
		{#each proxyItems as item, index (index)}
			{@const key = getKeyFromPath([index])}
			{@const isSelected = equals(item.value, value)}
			{@const isFocused = wrapper.focusedKey === key}
			<button
				data-tabs-trigger
				data-path={getKeyFromPath([index])}
				role="tab"
				aria-selected={isSelected}
				aria-controls="tab-panel-{index}"
				class:selected={isSelected}
				class:focused={isFocused}
				tabindex="0"
				id={`tab-${index}`}
			>
				{@render tabItemSnippet(item)}
				{#if editable}
					<Icon
						data-icon-remove
						name={tabIcons.close}
						role="button"
						onclick={() => handleRemove(item.value)}
					/>
				{/if}
			</button>
		{/each}
		{#if editable}
			<Icon data-icon-add name={tabIcons.add} role="button" onclick={handleAdd} />
		{/if}
	</div>

	<!-- Tab Panels -->
	{#each proxyItems as item, index (index)}
		{@const isVisible = equals(item.value, value)}

		<div
			data-tabs-panel
			role="tabpanel"
			id="tab-panel-{index}"
			aria-labelledby="tab-{index}"
			data-panel-active={isVisible}
		>
			{@render tabPanelSnippet(item)}
		</div>
	{/each}
</div>
