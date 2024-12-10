<script>
	import { equals } from 'ramda'
	import { defaultFields, getComponent } from '@rokkit/core'
	import { Item } from '@rokkit/ui'
	import { createView } from '@rokkit/stores'
	import { switchable } from '@rokkit/actions'

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
		value = $bindable(false),
		options = [false, true],
		compact = false,
		disabled = false,
		fields = defaultFields,
		using = {}
	} = $props()

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
		// using = { default: Item, ...using }
	})

	let actionConfig = $state({
		options,
		value,
		vertical: false,
		index: 0
	})
	const customView = $derived(!options.every((item) => [false, true].includes(item)))
</script>

{#if !Array.isArray(options) || options.length < 2}
	<error>The options should be an array with at least two items.</error>
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
		use:switchable={actionConfig}
	>
		{#each options as item, index (item)}
			<item class="relative" role="option" aria-selected={equals(item, value)} data-path={index}>
				{#if equals(item, value)}
					<indicator class="absolute bottom-0 left-0 right-0 top-0"></indicator>
				{/if}
				{#if customView}
					{@const SvelteComponent = getComponent(item, fields, using)}
					<SvelteComponent value={item} {fields} />
				{/if}
			</item>
		{/each}
	</toggle-switch>
{/if}
