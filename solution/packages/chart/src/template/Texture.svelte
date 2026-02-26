<script>
	import { library } from './constants'
	import * as templates from './shapes'
	import { pick } from 'ramda'

	let { size = 10, fill = 'none', stroke = 'none', thickness = 0.5, name = 'Waves' } = $props()

	let pattern = $derived(library[name])
	let props = $derived(pick(pattern.allowed ?? [], { fill, stroke, thickness }))
	let Component = $derived(templates[pattern.component])
</script>

<Component {size} {...props} data={pattern.data} />
