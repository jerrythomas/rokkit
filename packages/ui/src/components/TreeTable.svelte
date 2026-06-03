<script lang="ts">
	/**
	 * TreeTable — hierarchical rows in a sortable grid.
	 *
	 * Accepts nested rows (each row may carry a `children: []` array).
	 * One designated "hierarchy" column owns the chevron + indent + tree
	 * connectors; other columns render plain cell values.
	 *
	 * Architecture mirrors Table.svelte:
	 *   ProxyTableTree → Wrapper → Navigator class
	 *
	 * The difference is in the data layer: ProxyTableTree's sort is
	 * applied per-sibling group so the parent/child structure survives
	 * any column sort.
	 */

	import type { TableColumn, TableSortIcons } from '../types/table.js'
	import type { TreeTableColumn, TreeTableProps } from '../types/tree-table.js'
	import { defaultTableSortIcons } from '../types/table.js'
	import { ProxyItem, ProxyTableTree, Wrapper, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import Connector from './Connector.svelte'

	let {
		data = [],
		columns: userColumns,
		value,
		values = $bindable<unknown[]>([]),
		selectable = 'single' as 'single' | 'multi' | false,
		caption,
		size = 'md',
		striped = false,
		disabled = false,
		lineStyle = 'solid',
		fields: userFields,
		onselect,
		onsort,
		class: className = '',
		icons: userIcons,
		header: headerSnippet,
		row: rowSnippet,
		cell: cellSnippet,
		empty: emptySnippet
	}: TreeTableProps = $props()

	const icons = $derived<TableSortIcons & { opened: string; closed: string }>({
		...defaultTableSortIcons,
		...DEFAULT_STATE_ICONS.node,
		...userIcons
	})

	// ─── ProxyTableTree + Wrapper ───────────────────────────────────

	const multiselect = $derived(selectable === 'multi')

	const proxyTable = $derived(
		new ProxyTableTree(data, { columns: userColumns, fields: userFields, onsort })
	)

	const wrapper = $derived(
		new Wrapper(proxyTable, {
			onselect: (_v: unknown, proxy: ProxyItem) => {
				if (selectable === false || disabled) return
				onselect?.(proxy.value, proxy.value as Record<string, unknown>)
			},
			collapsible: true,
			multiselect
		})
	)

	$effect(() => {
		wrapper.moveToValue(value)
	})
	$effect(() => {
		if (multiselect) values = (wrapper.selected as unknown[]).slice()
	})

	// ─── Hierarchy column resolution ────────────────────────────────

	const hierarchyColumn = $derived(
		proxyTable.columns.find((c: TreeTableColumn) => c.hierarchy) ?? proxyTable.columns[0]
	)

	function isHierarchyColumn(column: TreeTableColumn): boolean {
		return hierarchyColumn?.name === column.name
	}

	// Mount Navigator on the table root
	let tableRef = $state<HTMLElement | null>(null)
	$effect(() => {
		if (!tableRef) return
		const w = wrapper
		const dir = getComputedStyle(tableRef).direction === 'rtl' ? 'rtl' : 'ltr'
		const nav = new Navigator(tableRef, w, { orientation: 'vertical', collapsible: true, dir })
		return () => nav.destroy()
	})

	// ─── Sort + cell rendering helpers ──────────────────────────────

	function handleSort(event: MouseEvent, column: TableColumn) {
		if (column.sortable === false || disabled) return
		proxyTable.sortBy(column.name, event.shiftKey)
	}

	function getCellValue(row: Record<string, unknown>, column: TableColumn): unknown {
		const fieldName = column.fields?.text ?? column.name
		return row[fieldName]
	}

	function formatCellValue(row: Record<string, unknown>, column: TableColumn): string {
		const cellValue = getCellValue(row, column)
		if (column.formatter) return column.formatter(cellValue, row)
		return cellValue !== null && cellValue !== undefined ? String(cellValue) : ''
	}

	/**
	 * The hierarchy cell shows the same column at every level. Group rows
	 * synthesised by `nestByColumns` carry `__label` (the grouping value),
	 * which we render in place of the column's normal field — that way the
	 * tree column displays e.g. "EMEA", "France", "Paris" at each depth
	 * even though the actual grouping column changes per level.
	 *
	 * Leaf rows (no `__label`) fall through to the column's regular value.
	 */
	function formatHierarchyValue(row: Record<string, unknown>, column: TableColumn): string {
		if (row.__label !== undefined && row.__label !== null) return String(row.__label)
		return formatCellValue(row, column)
	}

	function getCellIcon(row: Record<string, unknown>, column: TableColumn): string | null {
		if (!column.fields?.icon) return null
		const iconValue = row[column.fields.icon]
		if (!iconValue) return null
		if (column.iconFormatter) return column.iconFormatter(iconValue)
		return String(iconValue)
	}
</script>

<div
	bind:this={tableRef}
	data-tree-table
	data-size={size}
	data-selectable={selectable || undefined}
	data-disabled={disabled || undefined}
	data-line-style={lineStyle}
	class={className || undefined}
>
	<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
	<table role="treegrid" aria-label={caption} data-table-striped={striped || undefined}>
		{#if caption}
			<caption data-table-caption>{caption}</caption>
		{/if}

		<thead data-table-header>
			{#if headerSnippet}
				{@render headerSnippet(proxyTable.columns, proxyTable.sortState)}
			{:else}
				<tr>
					{#each proxyTable.columns as column (column.name)}
						<th
							data-table-header-cell
							data-column={column.name}
							data-sortable={column.sortable !== false || undefined}
							data-sort-order={column.sorted ?? 'none'}
							data-hierarchy={isHierarchyColumn(column) || undefined}
							scope="col"
							aria-sort={column.sorted === 'ascending'
								? 'ascending'
								: column.sorted === 'descending'
									? 'descending'
									: 'none'}
							style:width={column.width}
							style:text-align={column.align}
							onclick={(e) => handleSort(e, column)}
						>
							<span data-table-header-text>{column.label ?? column.name}</span>
							{#if column.sortable !== false}
								{@const sortIcon = icons[column.sorted ?? 'none'] ?? icons.none}
								<span data-table-sort-icon class={sortIcon} aria-hidden="true"></span>
							{/if}
						</th>
					{/each}
				</tr>
			{/if}
		</thead>

		<tbody data-table-body>
			{#if wrapper.flatView.length === 0}
				{#if emptySnippet}
					<tr data-table-empty-row>
						<td colspan={proxyTable.columns.length}>
							{@render emptySnippet()}
						</td>
					</tr>
				{:else}
					<tr data-table-empty-row>
						<td data-table-empty colspan={proxyTable.columns.length}
							>{messages.table.empty}</td
						>
					</tr>
				{/if}
			{:else}
				{#each wrapper.flatView as entry, rowIndex (entry.key)}
					{@const proxy = entry.proxy}
					{@const row = proxy.value as Record<string, unknown>}
					{@const isSelected = wrapper.selectedKeys.has(entry.key)}
					{@const isFocused = wrapper.focusedKey === entry.key}
					{@const isGroup = row.__group === true}
					{#if rowSnippet}
						{@render rowSnippet(row, proxyTable.columns, rowIndex, isSelected)}
					{:else}
						<tr
							data-table-row
							data-tree-table-row
							data-path={entry.key}
							data-tree-level={entry.level - 1}
							data-tree-has-children={entry.isExpandable || undefined}
							data-selected={isSelected || undefined}
							data-focused={isFocused || undefined}
							data-group={isGroup || undefined}
							aria-selected={isSelected}
							aria-rowindex={rowIndex + 1}
							aria-level={entry.level}
							aria-expanded={entry.isExpandable ? proxy.expanded : undefined}
							tabindex={isFocused ? 0 : -1}
						>
							{#each proxyTable.columns as column (column.name)}
								{@const hierarchy = isHierarchyColumn(column)}
								{#if cellSnippet}
									<td
										data-table-cell
										data-column={column.name}
										data-label={column.label ?? column.name}
										data-hierarchy={hierarchy || undefined}
										style:text-align={column.align}
									>
										{#if hierarchy}
											<span data-tree-table-cell-prefix>
												{#each entry.lineTypes as lineType, lineIndex (lineIndex)}
													{#if lineType === 'icon'}
														<button
															type="button"
															data-tree-table-toggle
															data-accordion-trigger
															aria-label={proxy.expanded ? 'Collapse' : 'Expand'}
															tabindex={-1}
														>
															<span
																class={proxy.expanded ? icons.opened : icons.closed}
																aria-hidden="true"
															></span>
														</button>
													{:else}
														<Connector type={lineType} />
													{/if}
												{/each}
											</span>
										{/if}
										{@render cellSnippet(getCellValue(row, column), column, row)}
									</td>
								{:else}
									{@const cellIcon = getCellIcon(row, column)}
									<td
										data-table-cell
										data-column={column.name}
										data-label={column.label ?? column.name}
										data-hierarchy={hierarchy || undefined}
										style:text-align={column.align}
									>
										{#if hierarchy}
											<span data-tree-table-cell-prefix>
												{#each entry.lineTypes as lineType, lineIndex (lineIndex)}
													{#if lineType === 'icon'}
														<button
															type="button"
															data-tree-table-toggle
															data-accordion-trigger
															aria-label={proxy.expanded ? 'Collapse' : 'Expand'}
															tabindex={-1}
														>
															<span
																class={proxy.expanded ? icons.opened : icons.closed}
																aria-hidden="true"
															></span>
														</button>
													{:else}
														<Connector type={lineType} />
													{/if}
												{/each}
											</span>
										{/if}
										{#if cellIcon}
											<span data-cell-icon class={cellIcon} aria-hidden="true"></span>
										{/if}
										<span data-cell-value
											>{hierarchy
												? formatHierarchyValue(row, column)
												: formatCellValue(row, column)}</span
										>
									</td>
								{/if}
							{/each}
						</tr>
					{/if}
				{/each}
			{/if}
		</tbody>
	</table>
</div>
