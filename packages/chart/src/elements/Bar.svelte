<script>
	import { format } from 'd3-format'
	import Label from './Label.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} rank
	 * @property {any} value
	 * @property {any} name
	 * @property {string} [formatString]
	 * @property {any} scales
	 * @property {number} [height]
	 * @property {any} fill
	 * @property {number} [spaceBetween]
	 */

	/** @type {Props} */
	let {
		rank,
		value,
		name,
		formatString = '.1%',
		scales,
		height = 60,
		fill,
		spaceBetween = 5
	} = $props();

	const textHeight = 16
	const charWidth = 12
	let y = $derived(rank * (height + spaceBetween))
	let width = $derived($scales.x(value))

	let textWidth = $derived(name.length * charWidth)
	let textOffset = $derived(width <= textWidth ? width + charWidth : width)
	let textAnchor = $derived(textOffset > width ? 'start' : 'end')

	let formattedValue = $derived(format(formatString)(value))
</script>

<rect x={$scales.x(0)} {y} {width} {height} {fill} opacity={0.5} />
<rect x={$scales.x(0)} {y} width={5} {height} {fill} />
<Label x={width} y={y + textHeight + 8} anchor={textAnchor} text={name} />
<Label x={width} y={y + height - 14} anchor={textAnchor} text={formattedValue} small />
