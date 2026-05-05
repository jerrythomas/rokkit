<script>
	/** @type {{ data: number[], width?: number, height?: number, color?: string }} */
	const { data, width = 120, height = 28, color = 'var(--color-primary-500)' } = $props()

	const points = $derived(() => {
		if (!data || data.length < 2) return ''
		const min = Math.min(...data)
		const max = Math.max(...data)
		const range = max - min || 1
		const stepX = width / (data.length - 1)
		const pad = 2
		const h = height - pad * 2
		return data
			.map((v, i) => `${i * stepX},${pad + h - ((v - min) / range) * h}`)
			.join(' ')
	})
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" class="sparkline">
	<polyline
		points={points()}
		fill="none"
		stroke={color}
		stroke-width="1.25"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
