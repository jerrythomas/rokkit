<script>
	let {
		id,
		path,
		fill = 'currentColor',
		stroke = 'currentColor',
		thickness = 0.5,
		patternUnits = 'userSpaceOnUse',
		size = 10
	} = $props()
</script>

<pattern {id} {patternUnits} width={size} height={size}>
	<rect width={size} height={size} {fill} />
	{#if path}
		<path d={path} fill="none" {stroke} stroke-width={thickness} />
	{/if}
</pattern>
