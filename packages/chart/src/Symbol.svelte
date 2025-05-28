<script>
	import { components } from './symbols'

	let {
		x = 0,
		y = 0,
		size = 10,
		fill = 'currentColor',
		stroke = 'currentColor',
		name = 'circle',
		...restProps
	} = $props()

	let RenderShape = $derived(components[name] ?? components.default)
	let props = $derived({ ...restProps, x, y, size, fill, stroke })
</script>

<!-- {#snippet defaultSymbol(props)}
	<circle cx={x} cy={y} r={size / 2} {fill} {stroke} />
{/snippet} -->
<RenderShape {...props} />
