<script>
	import { patterns } from './constants'

	let { size = 10, thickness = 0.5, stroke = 'currentColor', name = 'cross-hatch' } = $props()

	let d = $derived(patterns[name](size))
</script>

<path {d} {stroke} stroke-width={thickness} fill="none" />
