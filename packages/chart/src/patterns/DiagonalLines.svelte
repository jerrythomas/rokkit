<script>
	let { size = 10, stroke = 'currentColor', thickness = 0.8 } = $props()
</script>

<line x1={-size * 0.5} y1={size * 0.5} x2={size * 0.5} y2={-size * 0.5} {stroke} stroke-width={thickness} stroke-linecap="round" />
<line x1={0} y1={size} x2={size} y2={0} {stroke} stroke-width={thickness} stroke-linecap="round" />
<line x1={size * 0.5} y1={size * 1.5} x2={size * 1.5} y2={size * 0.5} {stroke} stroke-width={thickness} stroke-linecap="round" />
