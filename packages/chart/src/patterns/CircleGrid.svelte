<script>
	let { size = 10, fill = 'currentColor', stroke = 'currentColor', thickness = 0.6 } = $props()

	let r = $derived(size * 0.2)
</script>

<!-- Top-left: outline -->
<circle cx={size * 0.25} cy={size * 0.25} {r} fill="none" {stroke} stroke-width={thickness} />
<!-- Bottom-right: outline -->
<circle cx={size * 0.75} cy={size * 0.75} {r} fill="none" {stroke} stroke-width={thickness} />
<!-- Bottom-left: filled -->
<circle cx={size * 0.25} cy={size * 0.75} {r} {fill} />
<!-- Top-right: filled -->
<circle cx={size * 0.75} cy={size * 0.25} {r} {fill} />
