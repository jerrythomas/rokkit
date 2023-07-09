<script>
	import { symbols } from './symbols'

	export let x = 0
	export let y = 0
	export let r = 5
	export let fill = 'none'
	export let stroke = 'currentColor'
	export let thickness = 0.5

	export let name = 'circle'

	$: d = symbols[name](r * 2)
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<path
	{d}
	{fill}
	{stroke}
	transform="translate({x - r},{y - r})"
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
