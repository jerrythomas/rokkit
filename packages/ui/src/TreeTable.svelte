<script>
	import { FieldMapper, createEmitter } from '@rokkit/core'
	import Icon from './Icon.svelte'
	import Item from './Item.svelte'
	import Connector from './Connector.svelte'

	/** @type {import('./types.js').TreeTableProps} */
	let {
		class: className = '',
		data = [],
		columns = [],
		fields = {},
		value = $bindable(null),
		selected = $bindable([]),
		multiSelect = false,
		striped = true,
		expanded = $bindable(true),
		onselect,
		onchange,
		onexpand,
		oncollapse
	} = $props()

	let fm = $derived(new FieldMapper(fields))
	let emitter = createEmitter({ onselect, onchange, onexpand, oncollapse }, [
		'select',
		'change',
		'expand',
		'collapse'
	])

	// Find the hierarchy column (column with path: true or hierarchy: true)
	let hierarchyColumn = $derived(columns.find((col) => col.hierarchy || col.path))
	let hierarchyKey = $derived(hierarchyColumn?.field || hierarchyColumn?.key || null)
	let separator = $derived(hierarchyColumn?.separator || '/')

	// Build hierarchy from flat data
	let processedData = $derived.by(() => {
		if (!hierarchyKey || !data.length) {
			return data.map((row, index) => ({
				row,
				depth: 0,
				isParent: false,
				isExpanded: false,
				isHidden: false,
				path: String(index),
				value: row[hierarchyKey] || ''
			}))
		}

		// Sort data by path to ensure parents come before children
		const sorted = [...data].sort((a, b) => {
			const pathA = a[hierarchyKey] || ''
			const pathB = b[hierarchyKey] || ''
			return pathA.localeCompare(pathB)
		})

		// Build hierarchy nodes
		const nodes = sorted.map((row) => {
			const pathValue = row[hierarchyKey] || ''
			const parts = pathValue.split(separator).filter((p) => p.length > 0)
			const depth = parts.length - 1
			const value = parts.length > 0 ? parts[parts.length - 1] : ''

			return {
				row,
				depth: Math.max(0, depth),
				path: pathValue,
				value,
				isParent: false,
				isExpanded: expanded,
				isHidden: false,
				children: [],
				parent: null
			}
		})

		// Determine parent/child relationships
		nodes.forEach((node) => {
			const parentPath = node.path.split(separator).slice(0, -1).join(separator)
			if (parentPath) {
				const parent = nodes.find((n) => n.path === parentPath)
				if (parent) {
					parent.isParent = true
					parent.children.push(node)
					node.parent = parent
				}
			}
		})

		// Set initial visibility based on expansion state
		const updateVisibility = (node) => {
			if (node.parent) {
				node.isHidden = node.parent.isHidden || !node.parent.isExpanded
			}
			node.children.forEach(updateVisibility)
		}
		nodes.filter((n) => !n.parent).forEach(updateVisibility)

		return nodes
	})

	// Visible rows (not hidden)
	let visibleData = $derived(processedData.filter((node) => !node.isHidden))

	function toggleExpansion(node) {
		if (!node.isParent) return

		node.isExpanded = !node.isExpanded

		// Update children visibility
		const updateChildVisibility = (n) => {
			n.children.forEach((child) => {
				child.isHidden = n.isHidden || !n.isExpanded
				updateChildVisibility(child)
			})
		}
		updateChildVisibility(node)

		if (node.isExpanded) {
			emitter.expand(node.row)
		} else {
			emitter.collapse(node.row)
		}
	}

	function handleRowClick(node) {
		if (node.isParent) {
			toggleExpansion(node)
		} else {
			value = node.row
			emitter.select(node.row)
			emitter.change(node.row)
		}
	}

	function getColumnValue(row, col) {
		const key = col.field || col.key
		return row[key]
	}
</script>

<div data-tree-table class={className}>
	<table class:striped>
		<thead>
			<tr>
				{#each columns as col (col.field || col.key)}
					<th data-column={col.field || col.key} style:width={col.width}>
						{col.label ?? col.field ?? col.key}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each visibleData as node, rowIndex (node.path || rowIndex)}
				{@const isSelected = value === node.row || selected.includes(node.row)}
				<tr
					data-row
					data-depth={node.depth}
					aria-selected={isSelected}
					aria-expanded={node.isParent ? node.isExpanded : undefined}
					onclick={() => handleRowClick(node)}
				>
					{#each columns as col, colIndex (col.field || col.key)}
						{@const cellValue = getColumnValue(node.row, col)}
						{@const isHierarchyCol = col === hierarchyColumn}
						<td data-column={col.field || col.key}>
							<div data-cell>
								{#if isHierarchyCol}
									<!-- Indentation for hierarchy -->
									{#each Array(node.depth) as _, i (i)}
										<span data-indent></span>
									{/each}

									<!-- Expand/collapse icon for parents -->
									{#if node.isParent}
										<Icon
											name={node.isExpanded ? 'node-opened' : 'node-closed'}
											label={node.isExpanded ? 'Collapse' : 'Expand'}
										/>
									{:else if node.depth > 0}
										<span data-indent></span>
									{/if}

									<!-- Cell value -->
									<span data-cell-value>{node.value || cellValue}</span>
								{:else}
									<!-- Regular cell -->
									{#if col.format}
										<span data-cell-value>{col.format(cellValue, node.row)}</span>
									{:else}
										<span data-cell-value>{cellValue ?? ''}</span>
									{/if}
								{/if}
							</div>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
