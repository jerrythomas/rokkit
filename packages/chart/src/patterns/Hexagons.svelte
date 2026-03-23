<script>
	let { size = 10, stroke = 'currentColor', thickness = 0.8 } = $props()

	let points = $derived(
		Array.from({ length: 6 }, (_, i) => {
			const a = (Math.PI / 3) * i
			const r = size * 0.46
			return `${size / 2 + r * Math.cos(a)},${size / 2 + r * Math.sin(a)}`
		}).join(' ')
	)
</script>

<polygon {points} fill="none" {stroke} stroke-width={thickness} stroke-linejoin="round" />
