<script>
	import { namedShapes } from './constants'

	let {
		x = 0,
		y = 0,
		size = 1,
		fill = 'none',
		stroke = 'currentColor',
		thickness = 1,
		name = 'circle',
		onclick,
		onmouseover,
		onmouseleave,
		onfocus,
		onblur
	} = $props()

	let d = $derived(name in namedShapes ? namedShapes[name](size) : namedShapes['circle'](size))
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<path
	{d}
	{fill}
	{stroke}
	transform="translate({x},{y})"
	stroke-width={thickness}
	fill-rule="evenodd"
	role="button"
	{onclick}
	{onmouseover}
	{onmouseleave}
	{onfocus}
	{onblur}
	tabindex="0"
/>
