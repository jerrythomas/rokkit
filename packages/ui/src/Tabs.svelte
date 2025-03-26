<script>
	import { defaultFields, defaultStateIcons, noop, getSnippet, FieldMapper } from '@rokkit/core'
	import { ListController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import Icon from './Icon.svelte'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [options]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [value]
	 * @property {boolean} [below]
	 * @property {string} [align]
	 * @property {boolean} [editable]
	 * @property {any} [icons]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		options = $bindable([]),
		value = $bindable(null),
		icons = $bindable(defaultStateIcons.action),
		fields = defaultFields,
		below = false,
		align = 'left',
		editable = false,
		onremove = noop,
		onadd = noop,
		onselect = noop,
		stub,
		...extra
	} = $props()

	function handleRemove(event) {
		if (typeof event.detail === Object) {
			event.detail[fields.isDeleted] = true
		} else {
			options = options.filter((i) => i !== event.detail)
		}

		onremove({ item: event.detail })
	}
	function handleAdd(event) {
		event.stopPropagation()
		onadd()
	}
	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		onselect({ item: value, indices: cursor })
	}
	let stateIcons = $derived({ ...defaultStateIcons.action, ...icons })
	let filtered = $derived(options.filter((item) => !item[fields.deleted]))
	let wrapper = $derived(new ListController(options, value, fields))
	let mapper = new FieldMapper(fields)
</script>

<rk-tabs
	class="flex w-full {className}"
	class:is-below={below}
	class:justify-center={align === 'center'}
	class:justify-end={align === 'right'}
	tabindex="0"
	role="listbox"
	use:navigator={{ wrapper, horizontal: true }}
	onaction={handleNav}
	onremove={handleRemove}
	onadd={handleAdd}
>
	{#each filtered as item, index (index)}
		{@const Template = getSnippet(extra, mapper.get('snippet', item), stub)}
		<rk-tab>
			{#if Template}
				<Template value={item} {fields} />
			{:else}
				<Item value={item} {fields} />
			{/if}
			{#if editable}
				<Icon
					name="remove"
					role="button"
					label="Delete Tab"
					size="small"
					onclick={() => handleRemove(item)}
				/>
			{/if}
		</rk-tab>
	{/each}
	{#if editable}
		<Icon name="add" role="button" label="Add Tab" size="small" onclick={handleAdd} />
	{/if}
</rk-tabs>
