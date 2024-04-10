<script>
	import { createEventDispatcher } from 'svelte'
	import { pick } from 'ramda'
	import { defaultFields, getComponent } from '@rokkit/core'
	import { Connector, Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'
	import TableHeaderCell from './TableHeaderCell.svelte'
	import { dataview } from '@rokkit/data'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	/** @type {Array<object>} */
	export let data = []
	/** @type {Array<object>} */
	export let columns = []
	/** @type {string|null} */
	export let caption = null
	/** @type {object|null} */
	export let summary = null
	export let striped = true
	export let value = null
	export let multiselect = false
	/** @type {string|null} */
	export let hierarchyField = null
	export let separator = '/'
	export let using = {}

	/** @type {any|null} */
	let currentItem = null

	$: using = { default: Item, ...using }
	$: view = dataview(data, { columns, path: hierarchyField, separator })

	function handleItemClick(event, index) {
		// const { hierarchy } = get(view)
		const item = $view.hierarchy[index]
		if (item.isParent) toggle(index)
		else {
			currentItem = item
			value = getValue(item)
			dispatch('click', value)

			if (event.metaKey) toggleSelection(event, item)
		}
	}

	function getValue(item) {
		return item.row
	}

	function toggleSelection(e, index) {
		e.stopPropagation()
		e.preventDefault()
		view.select(index)

		dispatch('select', $view.hierarchy.filter((i) => i._selected === 'checked').map(getValue))
	}

	function toggle(index) {
		view.toggle(index)
	}

	function handleSort(event) {
		const { name, order, extend } = event.detail
		if (!extend || order === 'none') view.clearSort()
		if (order === 'none') return
		const ascending = order === 'ascending'
		view.sortBy(name, ascending)
	}

	$: using = { default: Item, ...using }
</script>

<tree-table class={className}>
	<table class:striped>
		{#if caption}
			<caption>
				{caption}
			</caption>
		{/if}
		<thead>
			<tr>
				{#each $view.columns as col}
					{@const props = pick(['name', 'label', 'sortable', 'order', 'class'], col)}
					<TableHeaderCell {...props} on:sort={handleSort} />
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $view.hierarchy as item, index}
				{#if !item.isHidden}
					<tr
						class:cursor-pointer={!item.isParent}
						aria-current={currentItem === item}
						on:click|stopPropagation={(e) => handleItemClick(e, index)}
					>
						{#each $view.columns as col, colIndex}
							{@const value = { ...pick(['icon'], col), ...item.row }}
							{@const fields = { ...defaultFields, text: col.name, ...col.fields }}
							{@const props = { ...pick(['fields', 'formatter'], col), fields }}
							{@const component = getComponent(value, fields, using)}
							<td>
								<cell class="cell-type-{col.type}">
									{#if multiselect && colIndex === 0}
										<Icon
											name={'checkbox-' + item._selected}
											class="small cursor-pointer"
											on:click={(e) => toggleSelection(e, item)}
										/>
									{:else}
										{#if col.path}
											{#each Array.from({ length: item.depth - 1 }) as _}
												<Connector type="empty" />
											{/each}
											{#if item.isParent}
												<Icon
													name={item.isExpanded ? 'node-opened' : 'node-closed'}
													class="small cursor-pointer"
												/>
											{:else if item.depth > 0}
												<Connector type="empty" />
											{/if}
										{/if}
										<!-- <item> -->
										<svelte:component this={component} {value} {...props} />
										<!-- </item> -->
									{/if}
								</cell>
							</td>
						{/each}
					</tr>
				{/if}
			{/each}
		</tbody>
		{#if summary}
			<tfoot>
				<tr>
					{#each $view.columns as { name, header, value }}
						{#if header}
							<th scope="row">{summary[name] ?? 'Total'}</th>
						{/if}
						{#if summary[name]}
							<td>{summary[name]}</td>
						{/if}
					{/each}
				</tr>
			</tfoot>
		{/if}
	</table>
</tree-table>
