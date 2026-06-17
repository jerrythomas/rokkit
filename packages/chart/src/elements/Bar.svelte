<script lang="ts">
	import type { Readable } from 'svelte/store'
	import { format } from 'd3-format'
	import { get } from 'svelte/store'
	import Label from './Label.svelte'

	type Scales = { x: (value: number) => number }

	type Props = {
		rank: number
		value: number
		name: string
		formatString?: string
		scales: Readable<Scales>
		height?: number
		fill?: string
		spaceBetween?: number
	}

	let {
		rank,
		value,
		name,
		formatString = '.1%',
		scales,
		height = 60,
		fill,
		spaceBetween = 5
	}: Props = $props()

	const textHeight = 16
	const charWidth = 12
	let y = $derived(rank * (height + spaceBetween))
	let width = $derived(get(scales).x(value))

	let textWidth = $derived(name.length * charWidth)
	let textOffset = $derived(width <= textWidth ? width + charWidth : width)
	let textAnchor = $derived(textOffset > width ? 'start' : 'end')

	let formattedValue = $derived(format(formatString)(value))
	let xOrigin = $derived(get(scales).x(0))
</script>

<rect x={xOrigin} {y} {width} {height} {fill} opacity={0.5} />
<rect x={xOrigin} {y} width={5} {height} {fill} />
<Label x={width} y={y + textHeight + 8} anchor={textAnchor} text={name} />
<Label x={width} y={y + height - 14} anchor={textAnchor} text={formattedValue} small />
