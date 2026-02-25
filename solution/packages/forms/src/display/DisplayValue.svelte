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

	const formatted = $derived.by(() => {
		if (value === null || value === undefined) return '—'
		switch (format) {
			case 'currency':
				return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
			case 'datetime':
				return new Date(value).toLocaleString()
			case 'duration':
				return formatDuration(value)
			case 'number':
				return new Intl.NumberFormat().format(value)
			case 'boolean':
				return value ? '✓' : '✗'
			case 'badge':
				return String(value)
			default:
				return String(value)
		}
	})
</script>

<span data-display-value data-format={format}>{formatted}</span>
