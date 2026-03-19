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

	function formatDuration(minutes) {
		const h = Math.floor(minutes / 60)
		const m = minutes % 60
		if (h > 0 && m > 0) return `${h}h ${m}m`
		if (h > 0) return `${h}h`
		return `${m}m`
	}

	const formatters = {
		currency: (v) =>
			new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v),
		datetime: (v) => new Date(v).toLocaleString(),
		duration: (v) => formatDuration(v),
		number: (v) => new Intl.NumberFormat().format(v),
		boolean: (v) => (v ? '✓' : '✗')
	}

	/**
	 * Create a cell formatter function for a given display format.
	 * @param {string} format
	 * @returns {(value: unknown) => string}
	 */
	function createFormatter(format) {
		const fn = formatters[format] ?? String
		return (value) => {
			if (value === null || value === undefined) return '—'
			return fn(value)
		}
	}
</script>

<div data-display-table data-selectable={select || undefined} class={className}>
	{#if title}
		<div data-display-title>{title}</div>
	{/if}
	<Table {data} columns={tableColumns} {onselect} caption={title} />
</div>
