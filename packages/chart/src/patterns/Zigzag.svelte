<script>
	let { size = 10, stroke = 'currentColor', thickness = 0.8 } = $props()

	let d = $derived(`M 0 ${size} L ${size * 0.5} 0 L ${size} ${size}`)
</script>

<path {d} fill="none" {stroke} stroke-width={thickness} stroke-linecap="round" stroke-linejoin="round" />
