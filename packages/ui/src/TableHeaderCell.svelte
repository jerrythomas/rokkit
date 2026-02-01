<script>
	import { noop } from '@rokkit/core'
	import Icon from './Icon.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} name
	 * @property {string|null} label
	 * @property {boolean} [sortable]
	 * @property {boolean} [hidden]
	 * @property {string} [order]
	 * @property {boolean} [disabled]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		name,
		label,
		sortable = false,
		hidden = false,
		order = $bindable('none'),
		disabled = false,
		onsort = noop
	} = $props()

	const handleSort = (event) => {
		if (!sortable || disabled) return
		event.stopPropagation()
		order = order === 'none' ? 'ascending' : order === 'ascending' ? 'descending' : 'none'
		const extend = event.getModifierState('Shift') || event.getModifierState('Control')
		onsort({ name, extend, order })
	}

	let title = $derived(label ?? name)
	let description = $derived(sortable ? `sort by ${title}` : title)
	let icon = $derived(`sort-${order}`)
</script>

{#if !hidden}
	<th
		scope="col"
		onclick={handleSort}
		data-sortable={sortable}
		data-disabled={disabled}
		aria-disabled={disabled}
		aria-label={description}
		class={className}
	>
		<div data-table-header-cell>
			{title}
			{#if sortable}
				<Icon name={icon} class="small" label="change the sort order" />
			{/if}
		</div>
	</th>
{/if}
