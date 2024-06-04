<script>
	import { library } from './constants'
	import * as templates from './shapes'
	import { pick } from 'ramda'

	export let size = 10
	export let fill = 'none'
	export let stroke = 'none'
	export let thickness = 0.5
	export let name = 'Waves'

	$: pattern = library[name]
	$: props = pick(pattern.allowed ?? [], { fill, stroke, thickness })
</script>

<svelte:component this={templates[pattern.component]} {size} {...props} data={pattern.data} />
