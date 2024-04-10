<script>
	import { Icon } from '@rokkit/atoms'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	/** @type {string} */
	export let name
	/** @type {string|null} */
	export let label
	export let sortable = false
	export let hidden = false
	export let order = 'none'

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
	<th
		scope="col"
		on:click={handleSort}
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
