<script>
	import { scaledPath } from '@rokkit/core'

	export let size = 10
	export let thickness = 0.5
	export let stroke = 'currentColor'

	const paths = [
		['M', 0, 0.25],
		['A', 0.6, 0.5, 0, 0, 0, 1, 0.25]
		// ['M', 0, 0.75],
		// ['A', 0.6, 0.5, 0, 0, 0, 1, 0.75]
	]
	$: d = scaledPath(size, paths)
</script>

<path {d} {stroke} stroke-width={thickness} fill="none" />
