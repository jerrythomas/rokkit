<script>
	let { size = 10, thickness = 0.5, stroke = 'currentColor' } = $props()

	// Zigzag wave: peak at 1/4 width, trough at 3/4 width
	let d = $derived(
		`M 0 ${size * 0.5} L ${size * 0.25} 0 L ${size * 0.75} ${size} L ${size} ${size * 0.5}`
	)
</script>

<path {d} {stroke} stroke-width={thickness} fill="none" stroke-linecap="round" stroke-linejoin="round" />
