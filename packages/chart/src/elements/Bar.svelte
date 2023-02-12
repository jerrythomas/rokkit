<script>
	import { format } from 'd3-format'
	import Label from './Label.svelte'

	export let rank
	export let value
	export let name
	export let formatString = '.1%'
	export let scales
	export let height = 60
	export let fill
	export let spaceBetween = 5

	const textHeight = 16
	const charWidth = 12
	$: y = rank * (height + spaceBetween)
	$: width = $scales.x(value)

	$: textWidth = name.length * charWidth
	$: textOffset = width <= textWidth ? width + charWidth : width
	$: textAnchor = textOffset > width ? 'start' : 'end'

	$: formattedValue = format(formatString)(value)
</script>

<rect x={$scales.x(0)} {y} {width} {height} {fill} opacity={0.5} />
<rect x={$scales.x(0)} {y} width={5} {height} {fill} />
<Label x={width} y={y + textHeight + 8} anchor={textAnchor} label={name} />
<Label
	x={width}
	y={y + height - 14}
	anchor={textAnchor}
	label={formattedValue}
	small
/>
