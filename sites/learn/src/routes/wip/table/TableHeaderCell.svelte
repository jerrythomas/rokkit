<script>
	import { Icon, Toggle } from '@rokkit/ui'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let name
	export let label
	export let sortable = false
	export let hidden = false
	export let order = 'none'

	const options = [
		{ icon: 'sort-none', value: 'none', label: 'None' },
		{ icon: 'sort-ascending', value: 'asc', label: 'Ascending' },
		{ icon: 'sort-descending', value: 'desc', label: 'Descending' }
	]
	let value = options.find((x) => x.value === order) ?? options[0]

	const handleSort = (event) => {
		if (!sortable) return
		event.stopPropagation()
		order = order === 'none' ? 'ascending' : order === 'ascending' ? 'descending' : 'none'
		const extend = event.getModifierState('Shift') || event.getModifierState('Control')
		dispatch('sort', { name, extend, order })
	}

	$: title = label ?? name
	$: description = sortable ? `sort by ${title}` : title
	$: icon = `sort-${order}`
</script>

{#if !hidden}
	<th scope="col" on:click={handleSort} data-sortable={sortable} aria-label={description}>
		<cell>
			{label ?? name}
			{#if sortable}
				<Icon name={icon} class="small" />
				<!-- <Toggle
					{options}
					{value}
					on:change={(e) => handleSort(name, e.detail)}
					minimal
					{description}
				/> -->
			{/if}
		</cell>
	</th>
{/if}
