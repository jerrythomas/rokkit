<script>
	import { noop } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} name
	 * @property {string|null} label
	 * @property {boolean} [sortable]
	 * @property {boolean} [hidden]
	 * @property {string} [order]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		name,
		label,
		sortable = false,
		hidden = false,
		order = $bindable('none'),
		onsort = noop
	} = $props()

	const handleSort = (event) => {
		if (!sortable) return
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
		aria-label={description}
		class={className}
	>
		<rk-cell>
			{title}
			{#if sortable}
				<Icon name={icon} class="small" label="change the sort order" />
			{/if}
		</rk-cell>
	</th>
{/if}
