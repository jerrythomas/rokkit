<script>
	/**
	 * Format-aware value display component.
	 * Renders a value with formatting based on the `format` hint.
	 */

	let { value, format = 'text' } = $props()

	/**
	 * Format a duration value (minutes) into human-readable string.
	 * @param {number} minutes
	 * @returns {string}
	 */
	function formatDuration(minutes) {
		if (typeof minutes !== 'number') return String(minutes)
		const h = Math.floor(minutes / 60)
		const m = minutes % 60
		if (h > 0 && m > 0) return `${h}h ${m}m`
		if (h > 0) return `${h}h`
		return `${m}m`
	}

	const valueFormatters = {
		currency: (v) =>
			new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v),
		datetime: (v) => new Date(v).toLocaleString(),
		duration: (v) => formatDuration(v),
		number: (v) => new Intl.NumberFormat().format(v),
		boolean: (v) => (v ? '✓' : '✗')
	}

	const formatted = $derived.by(() => {
		if (value === null || value === undefined) return '—'
		const fn = valueFormatters[format] ?? String
		return fn(value)
	})
</script>

<span data-display-value data-format={format}>{formatted}</span>
