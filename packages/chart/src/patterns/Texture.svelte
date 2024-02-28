<script>
	import { library } from './constants'
	import templates from './templates'
	import { pick } from 'ramda'

	export let size = 10
	export let fill = 'none'
	export let stroke = 'none'
	export let name = 'Waves'

	$: pattern = library[name]
	$: props = { fill, stroke }
</script>

<svelte:component
	this={templates[pattern.component]}
	{size}
	{...pick(pattern.allowed, props)}
	data={pattern.data}
/>
