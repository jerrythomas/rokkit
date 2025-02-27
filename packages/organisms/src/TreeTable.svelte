<script>
	import { pick, omit } from 'ramda'
	import { defaultMapping } from '@rokkit/molecules/constants'
	import { Connector, Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'

	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [data]
	 * @property {any} [columns]
	 * @property {boolean} [striped]
	 * @property {any} [value]
	 * @property {boolean} [multiselect]
	 * @property {any} [using]
	 * @property {any} [dataFilter]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		data = [],
		columns = $bindable([]),
		striped = true,
		value = $bindable(null),
		multiselect = false,
		using = $bindable({}),
		dataFilter = () => true
	} = $props()

	let hiddenPaths = []
	let currentItem = $state(null)

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
		if (item._selected !== 'checked') item._selected = 'checked'
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
		visible = [...data.filter(dataFilter).filter(isVisible)]
		dispatch('select', data.filter((i) => i._selected === 'checked').map(getValue))
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
			visible = [...data.filter(dataFilter).filter(isVisible)]
		}
	}

	function isVisible(item) {
		if (hiddenPaths.length === 0) return true
		return !hiddenPaths.some((i) => item[nestedColumn.key].startsWith(i))
	}

	function addMultiSelectColumn(multiselect, data) {
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

	let visible = $derived(() => data.filter(dataFilter).filter(isVisible))
	let nestedColumn = $derived(columns.find((col) => col.path))
	$effect(() => {
		addMultiSelectColumn(multiselect, data)
	})
</script>

<rk-tree-table class={className}>
	<table class:striped>
		<thead>
			<tr>
				{#each columns as col}
					<th>{col.label ?? col.key}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each visible as item, index}
				<tr
					class:cursor-pointer={!item._isParent}
					aria-current={currentItem === item}
					onclick={stopPropagation((e) => handleItemClick(e, item))}
				>
					{#each columns as col, index}
						{@const value = { ...pick(['icon'], col), ...item }}
						{@const SvelteComponent = mapping.getComponent(item)}
						<td>
							<cell>
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
									<SvelteComponent {value} {mapping} />
								{/if}
							</cell>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</rk-tree-table>
