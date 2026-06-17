<script lang="ts">
	/**
	 * Wraps @rokkit/ui Table for display-only rendering from layout schema.
	 * Maps display columns (key/label/format) to TableColumn format.
	 */
	import { Table } from '@rokkit/ui'
	import type { TableColumn } from '@rokkit/ui'

	type DisplayColumn = {
		key: string
		label?: string
		sortable?: boolean
		width?: string
		align?: 'left' | 'center' | 'right'
		format?: string
	}

	type Props = {
		data?: Array<Record<string, unknown>>
		columns?: DisplayColumn[]
		select?: 'one' | 'many'
		title?: string
		onselect?: (value: unknown, row: Record<string, unknown>) => void
		class?: string
	}

	let { data = [], columns = [], select, title, onselect, class: className = '' }: Props = $props()

	// Map display columns → Table columns with formatters
	const tableColumns = $derived<TableColumn[]>(
		columns.map((col) => ({
			name: col.key,
			label: col.label ?? col.key,
			sortable: col.sortable ?? true,
			width: col.width,
			align: col.align,
			formatter: col.format ? createFormatter(col.format) : undefined
		}))
	)

	function formatDuration(minutes: number): string {
		const h = Math.floor(minutes / 60)
		const m = minutes % 60
		if (h > 0 && m > 0) return `${h}h ${m}m`
		if (h > 0) return `${h}h`
		return `${m}m`
	}

	function toDate(v: unknown): Date {
		if (v instanceof Date) return v
		if (typeof v === 'number') return new Date(v)
		return new Date(String(v))
	}

	const formatters: Record<string, (v: unknown) => string> = {
		currency: (v) =>
			new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v)),
		datetime: (v) => toDate(v).toLocaleString(),
		duration: (v) => formatDuration(Number(v)),
		number: (v) => new Intl.NumberFormat().format(Number(v)),
		boolean: (v) => (v ? '✓' : '✗')
	}

	/**
	 * Create a cell formatter function for a given display format.
	 */
	function createFormatter(format: string): (value: unknown) => string {
		const fn = formatters[format] ?? String
		return (value: unknown) => {
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
