<script lang="ts">
	/**
	 * Format-aware value display component.
	 * Renders a value with formatting based on the `format` hint.
	 */

	type Props = {
		value?: unknown
		format?: string
	}

	let { value, format = 'text' }: Props = $props()

	/**
	 * Format a duration value (minutes) into human-readable string.
	 */
	function formatDuration(minutes: unknown): string {
		if (typeof minutes !== 'number') return String(minutes)
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

	const valueFormatters: Record<string, (v: unknown) => string> = {
		currency: (v) =>
			new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v)),
		datetime: (v) => toDate(v).toLocaleString(),
		duration: (v) => formatDuration(v),
		number: (v) => new Intl.NumberFormat().format(Number(v)),
		boolean: (v) => (v ? '✓' : '✗')
	}

	const formatted = $derived.by(() => {
		if (value === null || value === undefined) return '—'
		const fn = valueFormatters[format] ?? String
		return fn(value)
	})
</script>

<span data-display-value data-format={format}>{formatted}</span>
