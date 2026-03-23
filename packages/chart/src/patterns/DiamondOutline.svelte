<script>
	let { size = 10, stroke = 'currentColor', thickness = 0.6 } = $props()
</script>

<rect
	x={size * 0.3}
	y={size * 0.3}
	width={size * 0.4}
	height={size * 0.4}
	transform="rotate(45 {size * 0.5} {size * 0.5})"
	{stroke}
	stroke-width={thickness}
	stroke-linecap="round"
	fill="none"
/>
