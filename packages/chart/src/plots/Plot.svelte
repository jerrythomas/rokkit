<script>
	import { plotter } from '../lib/plots'
	import { compact } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {any} [data]
	 * @property {'lineY'|'lineX'|'dot'|'plot'|'bar'} [type]
	 * @property {any} [width]
	 * @property {any} [height]
	 * @property {string} [x]
	 * @property {string} [y]
	 * @property {any} [fill]
	 * @property {any} [stroke]
	 * @property {any} [symbol]
	 * @property {boolean} [grid]
	 * @property {boolean} [legend]
	 * @property {any} [labels]
	 * @property {boolean} [tip]
	 * @property {any} [channels]
	 */

	/** @type {Props} */
	let {
		data = [],
		type = 'dot',
		width = null,
		height = null,
		x = 'x',
		y = 'y',
		fill = null,
		stroke = null,
		symbol = null,
		grid = true,
		legend = false,
		labels = {},
		tip = true,
		channels = null
	} = $props()

	let showLegend = $derived(
		compact({
			stroke: stroke ? { legend } : null,
			color: fill && !symbol ? { legend } : null,
			symbol: symbol ? { legend } : null
		})
	)
	let config = $derived({
		data,
		type,
		aes: compact({ x, y, fill, stroke, symbol, tip, channels }),
		opts: compact({
			width,
			height,
			grid,
			...showLegend,
			x: { label: labels?.x ?? x },
			y: { label: labels?.y ?? y }
		})
	})
</script>

<plot use:plotter={config}></plot>
