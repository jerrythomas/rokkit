<script>
	import { getContext, onMount, onDestroy } from 'svelte'

	let {
		x,
		y,
		color = undefined,
		fill: fillProp = undefined,
		stat = 'identity',
		options = {}
	} = $props()

	const radius = $derived(options.radius ?? 20)

	const plotState = getContext('plot-state')
	let id = $state(null)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'hexbin',
			channels: { x, y, color: fillProp ?? color },
			stat
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, {
				channels: { x, y, color: fillProp ?? color },
				stat
			})
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const continuousColor = $derived(plotState.continuousColorScale)

	// Hex binning: group data points into hexagonal cells
	function hexBin(data, xField, yField, xScale, yScale, r) {
		const dx = r * 2 * Math.sin(Math.PI / 3) // horizontal spacing
		const dy = r * 1.5                        // vertical spacing
		const bins = new Map()

		for (const d of data) {
			const px = xScale(d[xField])
			const py = yScale(d[yField])
			if (px === null || px === undefined || py === null || py === undefined) continue

			// Find nearest hex center
			const col = Math.round(px / dx)
			const row = Math.round(py / dy)
			const cx = col * dx + (row % 2 ? dx / 2 : 0)
			const cy = row * dy
			const key = `${col},${row}`

			if (!bins.has(key)) {
				bins.set(key, { cx, cy, count: 0, points: [] })
			}
			const bin = bins.get(key)
			bin.count++
			bin.points.push(d)
		}
		return [...bins.values()]
	}

	// Build hexagon path for a given radius
	function hexPath(r) {
		const angles = [0, 1, 2, 3, 4, 5].map((i) => ((i * 60 - 30) * Math.PI) / 180)
		return `${angles.map((a, i) => `${i === 0 ? 'M' : 'L'}${r * Math.cos(a)},${r * Math.sin(a)}`).join('')  }Z`
	}

	const hexes = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const bins = hexBin(data, x, y, xScale, yScale, radius)
		const maxCount = Math.max(1, ...bins.map((b) => b.count))
		const colorScale = continuousColor?.scale

		return bins.map((bin, i) => ({
			key: `hex-${i}`,
			cx: bin.cx,
			cy: bin.cy,
			count: bin.count,
			fill: colorScale
				? colorScale(bin.count)
				: `rgba(66, 133, 244, ${0.1 + 0.9 * (bin.count / maxCount)})`,
			data: { count: bin.count, x: bin.cx, y: bin.cy }
		}))
	})

	const hex = $derived(hexPath(radius))
</script>

{#if hexes.length > 0}
	<g data-plot-geom="hexbin">
		{#each hexes as h (h.key)}
			<path
				transform="translate({h.cx},{h.cy})"
				d={hex}
				fill={h.fill}
				stroke="white"
				stroke-width="0.5"
				data-plot-element="hex"
				onmouseenter={() => plotState.setHovered(h.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{h.count} points</title>
			</path>
		{/each}
	</g>
{/if}
