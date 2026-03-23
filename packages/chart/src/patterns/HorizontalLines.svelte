<script>
	let { size = 10, stroke = 'currentColor', thickness = 0.8 } = $props()
</script>

<line x1={0} y1={size * 0.25} x2={size} y2={size * 0.25} {stroke} stroke-width={thickness} />
<line x1={0} y1={size * 0.75} x2={size} y2={size * 0.75} {stroke} stroke-width={thickness} />
