<script lang="ts">
	import type { TableProps, TableColumn, TableSortIcons } from '../types/table.js'
	import { defaultTableSortIcons } from '../types/table.js'
	import { TableController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'

	let {
		data = [],
		columns: userColumns,
		value,
		caption,
		size = 'md',
		striped = false,
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

	// ─── Controller ─────────────────────────────────────────────────

	 
	let controller = new TableController(data, {
		columns: userColumns,
		fields: userFields,
		value
	})
	let tableRef = $state<HTMLElement | null>(null)

	// Sync data changes to controller
	$effect(() => {
		controller.update(data)
	})

	// Sync columns changes
	$effect(() => {
		if (userColumns) {
			controller.columns = userColumns.map((c) => ({
				sortable: true,
				sorted: 'none',
				...c
			}))
		}
	})

	// ─── Focus management ───────────────────────────────────────────

	$effect(() => {
		if (!tableRef) return
		const el = tableRef

		function onAction(event: Event) {
			const detail = (event as CustomEvent).detail

			if (detail.name === 'move') {
				const key = controller.focusedKey
				if (key) {
					const target = el.querySelector(`[data-path="${key}"]`) as HTMLElement | null
					if (target && target !== document.activeElement) {
						target.focus()
						target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
					}
				}
			}

			if (detail.name === 'select') {
				handleSelectAction()
			}
		}

		el.addEventListener('action', onAction)
		return () => el.removeEventListener('action', onAction)
	})

	function handleFocusIn(event: FocusEvent) {
		const target = event.target as HTMLElement
		if (!target) return
		const path = target.dataset.path
		if (path !== undefined) {
			controller.moveTo(path)
		}
	}

	function handleSelectAction() {
		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		if (!disabled) {
			onselect?.(proxy.value, proxy.value as Record<string, unknown>)
		}
	}

	// ─── Sort ───────────────────────────────────────────────────────

	function handleSort(event: MouseEvent, column: TableColumn) {
		if (column.sortable === false || disabled) return
		controller.sortBy(column.name, event.shiftKey)
		onsort?.(controller.sortState)
	}

	// ─── Cell rendering helpers ─────────────────────────────────────

	function getCellValue(row: Record<string, unknown>, column: TableColumn): unknown {
		const fieldName = column.fields?.text ?? column.name
		return row[fieldName]
	}

	function formatCellValue(row: Record<string, unknown>, column: TableColumn): string {
		const value = getCellValue(row, column)
		if (column.formatter) return column.formatter(value, row)
		return value !== null && value !== undefined ? String(value) : ''
	}

	function getCellIcon(row: Record<string, unknown>, column: TableColumn): string | null {
		if (!column.fields?.icon) return null
		const iconValue = row[column.fields.icon]
		if (!iconValue) return null
		if (column.iconFormatter) return column.iconFormatter(iconValue)
		return String(iconValue)
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={tableRef}
	data-table
	data-size={size}
	data-disabled={disabled || undefined}
	class={className || undefined}
	onfocusin={handleFocusIn}
	use:navigator={{ wrapper: controller, orientation: 'vertical' }}
>
	<table
		role="grid"
		aria-label={caption}
		data-striped={striped || undefined}
	>
		{#if caption}
			<caption data-table-caption>{caption}</caption>
		{/if}

		<thead data-table-header>
			{#if headerSnippet}
				{@render headerSnippet(controller.columns, controller.sortState)}
			{:else}
				<tr>
					{#each controller.columns as column (column.name)}
						<th
							data-table-header-cell
							data-column={column.name}
							data-sortable={column.sortable !== false || undefined}
							data-sort-order={column.sorted ?? 'none'}
							scope="col"
							aria-sort={column.sorted === 'ascending' ? 'ascending' : column.sorted === 'descending' ? 'descending' : 'none'}
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
			{#if controller.data.length === 0}
				{#if emptySnippet}
					<tr data-table-empty-row>
						<td colspan={controller.columns.length}>
							{@render emptySnippet()}
						</td>
					</tr>
				{:else}
					<tr data-table-empty-row>
						<td data-table-empty colspan={controller.columns.length}>
							No data
						</td>
					</tr>
				{/if}
			{:else}
				{#each controller.data as entry, rowIndex (entry.key)}
					{@const row = entry.value as Record<string, unknown>}
					{@const isSelected = controller.selectedKeys.has(entry.key)}
					{@const isFocused = controller.focusedKey === entry.key}
					{#if rowSnippet}
						{@render rowSnippet(row, controller.columns, rowIndex, isSelected)}
					{:else}
						<tr
							data-table-row
							data-path={entry.key}
							data-selected={isSelected || undefined}
							data-focused={isFocused || undefined}
							role="row"
							aria-selected={isSelected}
							aria-rowindex={rowIndex + 1}
							tabindex={isFocused ? 0 : -1}
						>
							{#each controller.columns as column (column.name)}
								{#if cellSnippet}
									<td
										data-table-cell
										data-column={column.name}
										style:text-align={column.align}
									>
										{@render cellSnippet(getCellValue(row, column), column, row)}
									</td>
								{:else}
									{@const cellIcon = getCellIcon(row, column)}
									<td
										data-table-cell
										data-column={column.name}
										style:text-align={column.align}
									>
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
