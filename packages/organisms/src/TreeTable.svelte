<script>
	import { createEventDispatcher } from 'svelte'
	import { pick, omit } from 'ramda'
	import { defaultFields } from '@rokkit/core'
	import { Connector, Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let data = []
	export let columns = []
	export let striped = true
	export let value = null
	export let multiselect = false

	let hiddenPaths = []
	let currentItem = null

	function handleItemClick(event, item) {
		if (item._isParent) toggle(item)
		else {
			currentItem = item
			value = getValue(item)
			dispatch('click', value)

			if (event.metaKey) toggleSelection(event, item)
		}
	}
	function getValue(item) {
		return omit(['_levels', '_isParent', '_isExpanded', '_depth', '_path', '_selected'], item)
	}
	function toggleSelection(e, item) {
		e.stopPropagation()
		e.preventDefault()
		if (item._selected != 'checked') item._selected = 'checked'
		else item._selected = 'unchecked'

		if (item._isParent) {
			data
				.filter((i) => i[nestedColumn.key].startsWith(item[nestedColumn.key] + '/'))
				.forEach((i) => (i._selected = item._selected))
		} else {
			const parents = data.filter(
				(i) => item[nestedColumn.key].startsWith(i[nestedColumn.key] + '/') && i._isParent
			)
			parents.map((p) => {
				const children = data.filter((i) =>
					i[nestedColumn.key].startsWith(p[nestedColumn.key] + '/')
				)
				const selectedChildren = children.filter((i) => i._selected === 'checked')

				if (selectedChildren.length === children.length) p._selected = 'checked'
				else if (selectedChildren.length === 0) p._selected = 'unchecked'
				else p._selected = 'unknown'
			})
		}
		filtered = [...data.filter(isVisible)]
		dispatch('select', data.filter((i) => i._selected).map(getValue))
	}
	function toggle(item) {
		if (nestedColumn === undefined) return

		const parentPath = item[nestedColumn.key] + '/'
		if (item._isParent) {
			item._isExpanded = !item._isExpanded
			if (item._isExpanded) {
				hiddenPaths = [...hiddenPaths.filter((i) => i !== parentPath)]
			} else {
				hiddenPaths = [...hiddenPaths, parentPath]
			}
			filtered = [...data.filter(isVisible)]
		}
	}

	function isVisible(item) {
		if (hiddenPaths.length === 0) return true
		return !hiddenPaths.some((i) => item[nestedColumn.key].startsWith(i))
	}

	function addMultiSelectColumn(multiselect) {
		if (multiselect) {
			if (columns.some((col) => col.key === '_selected')) return
			columns = [{ key: '_selected', label: '', width: '3rem' }, ...columns]
			data.forEach((item) => {
				item._selected = 'unchecked'
			})
		} else {
			columns = [...columns.filter((col) => col.key !== '_selected')]
		}
	}

	$: filtered = data
	$: addMultiSelectColumn(multiselect)
	$: sizes = columns.map((col) => col.width ?? '1fr').join(' ')
	$: nestedColumn = columns.find((col) => col.path)
</script>

<tree-table class={className} style:--sizes={sizes}>
	<table>
		<thead>
			<tr>
				{#each columns as col}
					<th>{col.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each filtered as item, index}
				{@const even = striped && index % 2 === 0}
				<tr
					class:even
					class:cursor-pointer={!item._isParent}
					aria-current={currentItem === item}
					on:click|preventDefault|stopPropagation={(e) => handleItemClick(e, item)}
				>
					{#each columns as col, index}
						{@const value = { ...pick(['icon'], col), ...item }}
						{@const fields = { ...defaultFields, text: col.key, ...col.fields }}
						<td>
							{#if multiselect && index === 0}
								<!-- {#if !item._isParent} -->
								<Icon
									name={'checkbox-' + item._selected}
									class="small cursor-pointer"
									on:click={(e) => toggleSelection(e, item)}
								/>
								<!-- {/if} -->
							{:else}
								{#if col.path}
									{#each item._levels.slice(0, -1) as _}
										<Connector type="empty" />
									{/each}
									{#if item._isParent}
										<Icon
											name={item._isExpanded ? 'node-opened' : 'node-closed'}
											class="small cursor-pointer"
										/>
									{:else if item._depth > 0}
										<Connector type="empty" />
									{/if}
								{/if}
								<Item {value} {fields} />
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</tree-table>

<style>
	tr {
		grid-template-columns: var(--sizes);
	}

	/* th,
	td {
		@apply px-4 py-3;
	}
	td :global(icon) {
		@apply text-secondary-700;
	} */
</style>
