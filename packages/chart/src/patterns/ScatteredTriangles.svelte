<script>
	let { size = 10, fill = 'currentColor', stroke = 'currentColor' } = $props()
</script>

<!-- Top-left triangle pointing up — light fill -->
<polygon
	points="{size * 0.25},{size * 0.15} {size * 0.125},{size * 0.35} {size * 0.375},{size * 0.35}"
	fill={fill}
/>
<!-- Bottom-right triangle pointing down — dark fill -->
<polygon
	points="{size * 0.625},{size * 0.65} {size * 0.875},{size * 0.65} {size * 0.75},{size * 0.85}"
	fill={stroke}
/>
