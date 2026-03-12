<script>
	/**
	 * Wraps @rokkit/ui Table for display-only rendering from layout schema.
	 * Maps display columns (key/label/format) to TableColumn format.
	 */
	import { Table } from '@rokkit/ui'

	let { data = [], columns = [], select, title, onselect, class: className = '' } = $props()

	// Map display columns → Table columns with formatters
	const tableColumns = $derived(
		columns.map((col) => ({
			name: col.key,
			label: col.label ?? col.key,
			sortable: col.sortable ?? true,
			width: col.width,
			align: col.align,
			formatter: col.format ? createFormatter(col.format) : undefined
		}))
	)

	/**
	 * Create a cell formatter function for a given display format.
	 * @param {string} format
	 * @returns {(value: unknown) => string}
	 */
	function createFormatter(format) {
		return (value) => {
			if (value === null || value === undefined) return '—'
			switch (format) {
				case 'currency':
					return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
						/** @type {number} */ (value)
					)
				case 'datetime':
					return new Date(/** @type {string|number} */ (value)).toLocaleString()
				case 'duration': {
					const minutes = /** @type {number} */ (value)
					const h = Math.floor(minutes / 60)
					const m = minutes % 60
					if (h > 0 && m > 0) return `${h}h ${m}m`
					if (h > 0) return `${h}h`
					return `${m}m`
				}
				case 'number':
					return new Intl.NumberFormat().format(/** @type {number} */ (value))
				case 'boolean':
					return value ? '✓' : '✗'
				default:
					return String(value)
			}
		}
	}
</script>

<div data-display-table data-selectable={select || undefined} class={className}>
	{#if title}
		<div data-display-title>{title}</div>
	{/if}
	<Table {data} columns={tableColumns} {onselect} caption={title} />
</div>
