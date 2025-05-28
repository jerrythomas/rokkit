<script>
	import { scaledPath } from '@rokkit/core'

	export let size = 10
	export let thickness = 0.5
	export let stroke = 'currentColor'
	export let fill = 'none'
	export let data = []

	$: d = scaledPath(size, data)
</script>

<path {d} {stroke} stroke-width={thickness} {fill} />
