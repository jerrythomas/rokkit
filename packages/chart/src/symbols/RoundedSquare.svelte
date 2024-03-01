<script>
	export let x = 0
	export let y = 0
	export let size = 1
	export let fill = 'currentColor'
	export let stroke = 'currentColor'

	$: r = size * 3.534
	$: props = { rx: r * 0.1, ry: r * 0.1, ...$$restProps }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<rect
	x={x - r}
	y={y - r}
	width={r * 2}
	height={r * 2}
	{fill}
	{stroke}
	{...props}
	role="button"
	on:click
	on:mouseover
	on:mouseleave
	on:focus
	tabindex="0"
/>
