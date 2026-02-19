<script>
	import { Accordion } from 'bits-ui'
	import { createEmitter, defaultFields, hasChildren } from '@rokkit/core'
	import { Proxy, messages } from '@rokkit/states'
	import Item from './Item.svelte'
	import Icon from './Icon.svelte'

	const eventNames = ['collapse', 'change', 'expand', 'click', 'select', 'toggle']

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any[]} [items]
	 * @property {import('@rokkit/core').FieldMapper} [fields]
	 * @property {boolean} [autoCloseSiblings]
	 * @property {boolean} [multiselect]
	 * @property {any} [value]
	 * @property {import('svelte').Snippet<[Proxy]>} [header]
	 * @property {import('svelte').Snippet<[Proxy]>} [child]
	 * @property {import('svelte').Snippet} [empty]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		items = $bindable([]),
		value = $bindable(null),
		fields = {},
		autoCloseSiblings = false,
		header,
		child,
		empty,
		oncollapse,
		onexpand,
		onchange,
		onselect,
		ontoggle
	} = $props()

	let emitter = $derived(
		createEmitter({ oncollapse, onexpand, onchange, onselect, ontoggle }, eventNames)
	)

	let derivedFields = $derived({ ...defaultFields, ...fields })

	// Determine accordion type based on autoCloseSiblings (single = close others when opening)
	let accordionType = $derived(autoCloseSiblings ? 'single' : 'multiple')

	// Create proxy items for data access
	let proxyItems = $derived(items.map((item) => new Proxy(item, fields)))

	// Track expanded state - use $state for bits-ui binding
	let expandedValue = $state(autoCloseSiblings ? '' : [])

	// Track previous expanded state for event emission
	let previousExpanded = $state([])

	/**
	 * Handle value changes from bits-ui accordion
	 * @param {string | string[] | undefined} newValue
	 */
	// Watch for expandedValue changes and sync to items + emit events
	$effect(() => {
		const newExpanded = Array.isArray(expandedValue)
			? expandedValue
			: expandedValue
				? [expandedValue]
				: []

		// Find newly expanded items
		const expanded = newExpanded.filter((v) => !previousExpanded.includes(v))
		// Find newly collapsed items
		const collapsed = previousExpanded.filter((v) => !newExpanded.includes(v))

		// Skip if no changes
		if (expanded.length === 0 && collapsed.length === 0) return

		// Update tracking state
		previousExpanded = [...newExpanded]

		// Update the source data's expanded state
		items = items.map((item, index) => {
			const key = String(index)
			const wasExpanded = item[derivedFields.expanded]
			const isNowExpanded = newExpanded.includes(key)

			if (wasExpanded !== isNowExpanded) {
				return { ...item, [derivedFields.expanded]: isNowExpanded }
			}
			return item
		})

		// Emit events
		expanded.forEach((key) => {
			const index = parseInt(key, 10)
			const item = items[index]
			emitter.expand?.({ item, index, value: item })
			emitter.toggle?.({ item, index, value: item, expanded: true })
		})

		collapsed.forEach((key) => {
			const index = parseInt(key, 10)
			const item = items[index]
			emitter.collapse?.({ item, index, value: item })
			emitter.toggle?.({ item, index, value: item, expanded: false })
		})

		emitter.change?.({ expandedItems: newExpanded, items })
	})

	/**
	 * Handle item selection
	 * @param {any} item
	 * @param {number} index
	 */
	function handleSelect(item, index) {
		value = item
		emitter.select?.({ item, index, value: item })
	}

	/**
	 * Check if an item is currently expanded
	 * @param {string} key
	 */
	function isExpanded(key) {
		if (Array.isArray(expandedValue)) {
			return expandedValue.includes(key)
		}
		return expandedValue === key
	}

	/**
	 * Toggle expansion state for a key
	 * @param {string} key
	 */
	function toggleExpanded(key) {
		if (Array.isArray(expandedValue)) {
			if (expandedValue.includes(key)) {
				expandedValue = expandedValue.filter((k) => k !== key)
			} else {
				expandedValue = [...expandedValue, key]
			}
		} else {
			expandedValue = expandedValue === key ? '' : key
		}
	}

	/**
	 * Handle keyboard events for arrow key expand/collapse
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		const target = event.target
		if (!target || !(target instanceof HTMLElement)) return

		// Only handle on triggers
		const trigger = target.closest('[data-accordion-trigger]')
		if (!trigger) return

		const key = trigger.getAttribute('data-path')
		if (!key) return

		const expanded = isExpanded(key)

		// ArrowRight expands, ArrowLeft collapses
		if (event.key === 'ArrowRight' && !expanded) {
			event.preventDefault()
			toggleExpanded(key)
		} else if (event.key === 'ArrowLeft' && expanded) {
			event.preventDefault()
			toggleExpanded(key)
		}
	}
</script>

{#snippet defaultHeader(proxy)}
	<Item value={proxy.value} {fields} {proxy} />
{/snippet}

{#snippet defaultChild(proxy)}
	<Item value={proxy.value} {fields} {proxy} />
{/snippet}

<Accordion.Root
	type={accordionType}
	bind:value={expandedValue}
	class={classes}
	loop={true}
	onkeydown={handleKeydown}
	data-accordion-root
>
	{#if items.length === 0}
		<div data-accordion-empty role="presentation">
			{#if empty}
				{@render empty()}
			{:else}
				{messages.current.emptyList}
			{/if}
		</div>
	{:else}
		{#each proxyItems as proxy, index (proxy.id)}
			{@const key = String(index)}
			{@const item = items[index]}
			{@const expanded = isExpanded(key)}
			{@const itemHasChildren = hasChildren(item, derivedFields)}
			{@const disabled = item[derivedFields.disabled] ?? false}
			{@const children = item[derivedFields.children] ?? []}

			{@const itemClasses = [expanded && 'is-expanded', value === item && 'is-selected']
				.filter(Boolean)
				.join(' ')}
			<Accordion.Item
				value={key}
				{disabled}
				data-accordion-item
				class={itemClasses}
				data-expanded={expanded}
				data-disabled={disabled}
			>
				<Accordion.Header data-accordion-header>
					<Accordion.Trigger data-accordion-trigger data-path={key}>
						{#if header}
							{@render header(proxy)}
						{:else}
							{@render defaultHeader(proxy)}
						{/if}
						{#if itemHasChildren}
							<span data-accordion-icon>
								<Icon
									name={expanded ? 'accordion-opened' : 'accordion-closed'}
									label={expanded ? 'collapse' : 'expand'}
									state={expanded ? 'opened' : 'closed'}
									class="w-4"
									size="small"
								/>
							</span>
						{/if}
					</Accordion.Trigger>
				</Accordion.Header>

				{#if itemHasChildren}
					<Accordion.Content data-accordion-content>
						{#each children as childItem, childIndex (childIndex)}
							{@const childProxy = new Proxy(childItem, fields.fields ?? fields)}
							<div
								data-accordion-child
								data-path={`${key}.${childIndex}`}
								class:is-selected={value === childItem}
								onclick={() => handleSelect(childItem, childIndex)}
								onkeydown={(e) => e.key === 'Enter' && handleSelect(childItem, childIndex)}
								role="button"
								tabindex="0"
							>
								{#if child}
									{@render child(childProxy)}
								{:else}
									{@render defaultChild(childProxy)}
								{/if}
							</div>
						{/each}
					</Accordion.Content>
				{/if}
			</Accordion.Item>
		{/each}
	{/if}
</Accordion.Root>
