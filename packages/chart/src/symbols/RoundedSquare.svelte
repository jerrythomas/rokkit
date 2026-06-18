<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	export interface Props extends Omit<SVGAttributes<SVGRectElement>, 'x' | 'y' | 'fill' | 'stroke'> {
		x?: number
		y?: number
		size?: number
		fill?: string
		stroke?: string
	}

	let {
		x = 0,
		y = 0,
		size = 1,
		fill = 'currentColor',
		stroke = 'currentColor',
		onclick,
		onmouseover,
		onmouseleave,
		onfocus,
		...restProps
	}: Props = $props()

	let r = $derived(size * 3.534)
</script>

<rect
	x={x - r}
	y={y - r}
	width={r * 2}
	height={r * 2}
	{fill}
	{stroke}
	rx={r * 0.1}
	ry={r * 0.1}
	{...restProps}
	role="button"
	{onclick}
	{onmouseover}
	{onmouseleave}
	{onfocus}
	tabindex="0"
/>
