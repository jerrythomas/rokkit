<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'
	import { components } from './symbols'

	type Props = {
		x?: number
		y?: number
		size?: number
		fill?: string
		stroke?: string
		name?: string
	} & Omit<SVGAttributes<SVGElement>, 'x' | 'y' | 'fill' | 'stroke'>

	let {
		x = 0,
		y = 0,
		size = 10,
		fill = 'currentColor',
		stroke = 'currentColor',
		name = 'circle',
		...restProps
	}: Props = $props()

	const shapes: Record<string, (typeof components)[keyof typeof components]> = components
	let RenderShape = $derived(shapes[name] ?? components.default)
</script>

<!-- {#snippet defaultSymbol(props)}
	<circle cx={x} cy={y} r={size / 2} {fill} {stroke} />
{/snippet} -->
<RenderShape {...restProps} {x} {y} {size} {fill} {stroke} />
