<script>
	let {
		x = 0,
		y = 0,
		size = 1,
		fill = 'currentColor',
		stroke = 'currentColor',
		onclick,
		onmouseover,
		onmouseleave,
		onfocus,
		...restProps
	} = $props()

	let r = $derived(size * 3.534)
	let props = $derived({ rx: r * 0.1, ry: r * 0.1, ...restProps })
</script>

<rect
	x={x - r}
	y={y - r}
	width={r * 2}
	height={r * 2}
	{fill}
	{stroke}
	{...props}
	role="button"
	{onclick}
	{onmouseover}
	{onmouseleave}
	{onfocus}
	tabindex="0"
/>
