<script>
	import { namedShapes } from './constants'

	export let x = 0
	export let y = 0
	export let size = 10
	export let fill = 'none'
	export let stroke = 'currentColor'
	export let thickness = 0.5

	export let name = 'circle'

	$: d = name in namedShapes ? namedShapes[name](size): namedShapes['star'](size)
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<path
	{d}
	{fill}
	{stroke}
	transform="translate({x - size/2},{y - size/2})"
	stroke-width={thickness}
	fill-rule="evenodd"
	role="button"
	on:click
	on:mouseover
	on:mouseleave
	on:focus
	on:blur
	tabindex="0"
/>
