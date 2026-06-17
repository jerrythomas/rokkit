<script lang="ts">
	import type { TableProps, TableColumn, TableSortIcons } from '../types/table.js'
	import { defaultTableSortIcons } from '../types/table.js'
	import { ProxyItem, ProxyTable, Wrapper, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'

	let {
		data = [],
		columns: userColumns,
		value,
		values = $bindable<unknown[]>([]),
		selectable = 'single' as 'single' | 'multi' | false,
		caption,
		size = 'md',
		striped = false,
		responsive = false,
		disabled = false,
		fields: userFields,
		onselect,
		onsort,
		class: className = '',
		icons: userIcons,
		header: headerSnippet,
		row: rowSnippet,
		cell: cellSnippet,
		empty: emptySnippet
	}: TableProps = $props()

	const icons = $derived<TableSortIcons>({ ...defaultTableSortIcons, ...userIcons })

	// ─── ProxyTable + Wrapper ───────────────────────────────────────

	const multiselect = $derived(selectable === 'multi')

	const proxyTable = $derived(
		new ProxyTable(data, { columns: userColumns, fields: userFields, onsort })
	)

	const wrapper = $derived(
		new Wrapper(proxyTable, {
			onselect: (_v: unknown, proxy: ProxyItem) => {
				if (selectable === false || disabled) return
				onselect?.(proxy.value, proxy.value as Record<string, unknown>)
			},
			collapsible: false,
			multiselect
		})
	)

	// Sync value bindings out
	$effect(() => {
		wrapper.moveToValue(value)
	})
	$effect(() => {
		if (multiselect) values = (wrapper.selected as unknown[]).slice()
	})

	// Mount Navigator on the table root
	let tableRef = $state<HTMLElement | null>(null)
	$effect(() => {
		if (!tableRef) return
		const w = wrapper
		const dir = getComputedStyle(tableRef).direction === 'rtl' ? 'rtl' : 'ltr'
		const nav = new Navigator(tableRef, w, { orientation: 'vertical', dir })
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
	data-table
	data-size={size}
	data-selectable={selectable || undefined}
	data-disabled={disabled || undefined}
	data-table-responsive={responsive || undefined}
	class={className || undefined}
>
	<table role="grid" aria-label={caption} data-table-striped={striped || undefined}>
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
								{@const sortIcon =
									icons[(column.sorted ?? 'none') as keyof TableSortIcons] ?? icons.none}
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
					{@const row = entry.proxy.value as Record<string, unknown>}
					{@const isSelected = wrapper.selectedKeys.has(entry.key)}
					{@const isFocused = wrapper.focusedKey === entry.key}
					{#if rowSnippet}
						{@render rowSnippet(row, proxyTable.columns, rowIndex, isSelected)}
					{:else}
						<tr
							data-table-row
							data-path={entry.key}
							data-selected={isSelected || undefined}
							data-focused={isFocused || undefined}
							aria-selected={isSelected}
							aria-rowindex={rowIndex + 1}
							tabindex={isFocused ? 0 : -1}
						>
							{#each proxyTable.columns as column (column.name)}
								{#if cellSnippet}
									<td data-table-cell data-column={column.name} data-label={column.label ?? column.name} style:text-align={column.align}>
										{@render cellSnippet(getCellValue(row, column), column, row)}
									</td>
								{:else}
									{@const cellIcon = getCellIcon(row, column)}
									<td data-table-cell data-column={column.name} data-label={column.label ?? column.name} style:text-align={column.align}>
										{#if cellIcon}
											<span data-cell-icon class={cellIcon} aria-hidden="true"></span>
										{/if}
										<span data-cell-value>{formatCellValue(row, column)}</span>
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
