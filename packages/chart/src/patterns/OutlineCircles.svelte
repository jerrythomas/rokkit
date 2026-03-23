<script>
	let { size = 10, stroke = 'currentColor', thickness = 1.5 } = $props()

	let r = $derived(size * 0.38)
</script>

<circle cx={size * 0.5} cy={size * 0.5} {r} fill="none" {stroke} stroke-width={thickness} />
