<script>
	import { Icon } from '@rokkit/atoms'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

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
		order = $bindable('none')
	} = $props()

	const handleSort = (event) => {
		if (!sortable) return
		event.stopPropagation()
		order = order === 'none' ? 'ascending' : order === 'ascending' ? 'descending' : 'none'
		const extend = event.getModifierState('Shift') || event.getModifierState('Control')
		dispatch('sort', { name, extend, order })
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
		<cell>
			{title}
			{#if sortable}
				<Icon name={icon} class="small" label="change the sort order" />
			{/if}
		</cell>
	</th>
{/if}
