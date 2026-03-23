<script>
	let { size = 10, fill = 'currentColor', stroke = 'currentColor', thickness = 0.6 } = $props()
</script>

<line x1={0} y1={0} x2={size} y2={size} {stroke} stroke-width={thickness} stroke-linecap="round" />
<line x1={0} y1={size} x2={size} y2={0} {stroke} stroke-width={thickness} stroke-linecap="round" />
<circle cx={size * 0.5} cy={size * 0.5} r={size * 0.22} {fill} />
