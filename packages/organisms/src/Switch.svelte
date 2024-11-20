<script>
	import { equals } from 'ramda'
	import { defaultFields, getComponent, createEmitter } from '@rokkit/core'
	import { Item } from '@rokkit/molecules'
	import { navigator } from '@rokkit/actions'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {Array<any>} [options]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {boolean} [compact]
	 * @property {boolean} [disabled]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		value = $bindable(),
		options = [false, true],
		fields = $bindable(defaultFields),
		using = $bindable({}),
		compact = false,
		disabled = false,
		...events
	} = $props()

	let cursor = $state([])
	let emitter = createEmitter(events, ['change'])
	function handleNav(event) {
		if (disabled) return
		if (event.detail.node === value) return
		value = event.detail.node
		cursor = event.detail.path
		emitter.change({ item: value, indices: cursor })
	}

	let useComponent = $derived(!options.every((item) => [false, true].includes(item)))
	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
		using = { default: Item, ...using }
	})
</script>

{#if !Array.isArray(options) || options.length < 2}
	<error>Items should be an array with at least two items.</error>
{:else}
	<toggle-switch
		class="flex items-center {className}"
		class:is-off={options.length === 2 && equals(value, options[0])}
		class:is-on={options.length === 2 && equals(value, options[1])}
		class:compact
		aria-label="Toggle Switch"
		aria-orientation="horizontal"
		aria-disabled={disabled}
		tabindex="0"
		role="listbox"
		use:navigator={{
			items: options,
			fields,
			vertical: false,
			indices: cursor
		}}
		onmove={handleNav}
		onselect={handleNav}
	>
		{#each options as item, index (item)}
			{@const component = useComponent ? getComponent(item, fields, using) : null}
			<item class="relative" role="option" aria-selected={equals(item, value)} data-path={index}>
				{#if equals(item, value)}
					<indicator class="absolute bottom-0 left-0 right-0 top-0"></indicator>
				{/if}
				{#if component}
					{@const SvelteComponent = component}
					<SvelteComponent value={item} {fields} />
				{/if}
			</item>
		{/each}
	</toggle-switch>
{/if}
