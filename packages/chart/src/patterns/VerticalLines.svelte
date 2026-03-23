<script>
	let { size = 10, stroke = 'currentColor', thickness = 0.8 } = $props()
</script>

<line x1={size * 0.25} y1={0} x2={size * 0.25} y2={size} {stroke} stroke-width={thickness} />
<line x1={size * 0.75} y1={0} x2={size * 0.75} y2={size} {stroke} stroke-width={thickness} />
