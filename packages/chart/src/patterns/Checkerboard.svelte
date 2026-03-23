<script>
	let { size = 10, fill = 'currentColor' } = $props()

	let half = $derived(size * 0.5)
</script>

<rect x={0} y={0} width={half} height={half} {fill} />
<rect x={half} y={half} width={half} height={half} {fill} />
