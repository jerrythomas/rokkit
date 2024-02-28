<script>
	import { patterns } from './constants'

	export let size = 10
	export let thickness = 0.5
	export let stroke = 'currentColor'
	export let name = 'cross-hatch'

	$: d = patterns[name](size)
</script>

<path {d} {stroke} stroke-width={thickness} fill="none" />
