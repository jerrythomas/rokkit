<script>
	export let x = 0
	export let y = 0
	export let size = 10
	export let fill = 'currentColor'
	export let stroke = 'currentColor'

	$: r = size / 2
	$: h = Math.sqrt(3) * r
	$: points = [x, y - r, x + h / 2, y + r / 2, x - h / 2, y + r / 2]
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<polygon
	points={points.join(', ')}
	{fill}
	{stroke}
	role="button"
	on:click
	on:mouseover
	on:mouseleave
	on:focus
	tabindex="0"
/>
