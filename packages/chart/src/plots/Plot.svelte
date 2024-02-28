<script>
	import { plotter } from '../lib/plots'
	import { compact } from '@rokkit/core'
	export let data = []
	/** @type {'lineY'|'lineX'|'dot'|'plot'|'bar'} */
	export let type = 'dot'
	export let width = null
	export let height = null
	export let x = 'x'
	export let y = 'y'
	export let fill = null
	export let stroke = null
	export let symbol = null
	export let grid = true
	export let legend = false
	export let labels = {}
	export let tip = true
	export let channels = null

	$: showLegend = compact({
		stroke: stroke ? { legend } : null,
		color: fill && !symbol ? { legend } : null,
		symbol: symbol ? { legend } : null
	})
	$: config = {
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
	}
</script>

<plot use:plotter={config} />
