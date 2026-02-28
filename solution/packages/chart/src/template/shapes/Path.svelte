<script>
	import { scaledPath } from '@rokkit/core'

	let { size = 10, thickness = 0.5, stroke = 'currentColor', data = [] } = $props()

	let d = $derived(scaledPath(size, data))
</script>

<path {d} {stroke} stroke-width={thickness} fill="none" />
