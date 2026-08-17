<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildBoxMarks } from './lib/marks/box.js'

	type Props = {
		x?: string
		y?: string
		/** Box interior aesthetic (field); defaults to `x`. */
		fill?: string
		/** Outline aesthetic (field); overrides whisker/median/border stroke when set. */
		color?: string
		stat?: string
		/** Offset the box to one half of the band (raincloud/split plots). Default 'center'. */
		side?: 'left' | 'right' | 'center'
		/** Box thickness as a fraction of the (sub-)band — use a small value (e.g. 0.16) for a
		 *  thin raincloud box. Defaults to the full box width. */
		width?: number
		/** Data field driving a texture fill (from the shared pattern set) instead of a solid fill. */
		pattern?: string
		/** Fixed box opacity 0–1; defaults to the per-geom preset (box = 0.5). */
		alpha?: number
	}

	let { x, y, fill, color, stat = 'boxplot', side = 'center', width, pattern, alpha }: Props =
		$props()

	const plotState = getContext<PlotState>('plot-state')

	// Fall back to the root Plot channels when the geom's own x/y are omitted, so
	// <Plot.Box> composes under <Plot.Root x y> without silently NaN-ing.
	const xf = $derived(x ?? plotState.channels?.x)
	const yf = $derived(y ?? plotState.channels?.y)
	// fill ?? effective-x drives the colors map for both box interior and whisker strokes
	const fillChannel = $derived(fill ?? xf)

	const geom = new GeomState(plotState, () => ({
		type: 'box',
		channels: { x: xf, y: yf, fill: fillChannel, color, pattern },
		stat,
		options: { side, width },
		alpha,
		build: buildBoxMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const boxes = $derived(geom.marks)
</script>

{#if boxes.length > 0}
	<g data-plot-geom="box">
		{#each boxes as box, i (`${String(box.cx)}::${i}`)}
			<!-- Each primitive is placed through plotState.place(band, value) so the whole
			     box transposes correctly under orientation='horizontal' (flip). -->
			{@const c1 = plotState.place(box.cx - box.width / 2, box.q3)}
			{@const c2 = plotState.place(box.cx + box.width / 2, box.q1)}
			{@const mA = plotState.place(box.cx - box.width / 2, box.median)}
			{@const mB = plotState.place(box.cx + box.width / 2, box.median)}
			{@const wLoA = plotState.place(box.cx, box.q1)}
			{@const wLoB = plotState.place(box.cx, box.iqr_min)}
			{@const wHiA = plotState.place(box.cx, box.q3)}
			{@const wHiB = plotState.place(box.cx, box.iqr_max)}
			{@const capLoA = plotState.place(box.cx - box.whiskerWidth / 2, box.iqr_min)}
			{@const capLoB = plotState.place(box.cx + box.whiskerWidth / 2, box.iqr_min)}
			{@const capHiA = plotState.place(box.cx - box.whiskerWidth / 2, box.iqr_max)}
			{@const capHiB = plotState.place(box.cx + box.whiskerWidth / 2, box.iqr_max)}
			<!-- Box body (IQR): lighter fill shade -->
			<rect
				x={Math.min(c1.x, c2.x)}
				y={Math.min(c1.y, c2.y)}
				width={Math.abs(c2.x - c1.x)}
				height={Math.abs(c2.y - c1.y)}
				fill={box.fill}
				fill-opacity={box.alpha}
				stroke={box.stroke}
				stroke-width="1"
				data-plot-element="box-body"
				role="graphics-symbol"
				aria-label={`${String(box.data[xf ?? ''] ?? 'box')}: median ${box.data.median}, IQR ${box.data.q1}–${box.data.q3}`}
				onmouseenter={() => plotState.setHovered(box.data)}
				onmouseleave={() => plotState.clearHovered()}
			/>
			{#if box.patternId}
				<!-- Texture fill overlay (matches the box body) -->
				<rect
					x={Math.min(c1.x, c2.x)}
					y={Math.min(c1.y, c2.y)}
					width={Math.abs(c2.x - c1.x)}
					height={Math.abs(c2.y - c1.y)}
					fill="url(#{box.patternId})"
					pointer-events="none"
				/>
			{/if}
			<!-- Median line: darker stroke shade -->
			<line
				x1={mA.x}
				y1={mA.y}
				x2={mB.x}
				y2={mB.y}
				stroke={box.stroke}
				stroke-width="2"
				data-plot-element="box-median"
			/>
			<!-- Lower whisker (q1 to iqr_min) -->
			<line
				x1={wLoA.x}
				y1={wLoA.y}
				x2={wLoB.x}
				y2={wLoB.y}
				stroke={box.stroke}
				stroke-width="1"
				data-plot-element="box-whisker"
			/>
			<!-- Upper whisker (q3 to iqr_max) -->
			<line
				x1={wHiA.x}
				y1={wHiA.y}
				x2={wHiB.x}
				y2={wHiB.y}
				stroke={box.stroke}
				stroke-width="1"
				data-plot-element="box-whisker"
			/>
			<!-- Lower whisker cap -->
			<line
				x1={capLoA.x}
				y1={capLoA.y}
				x2={capLoB.x}
				y2={capLoB.y}
				stroke={box.stroke}
				stroke-width="1"
			/>
			<!-- Upper whisker cap -->
			<line
				x1={capHiA.x}
				y1={capHiA.y}
				x2={capHiB.x}
				y2={capHiB.y}
				stroke={box.stroke}
				stroke-width="1"
			/>
			<!-- Outliers: individual points beyond the 1.5·IQR fence -->
			{#each box.outliers as o, oi (`${i}-outlier-${oi}`)}
				{@const op = plotState.place(box.cx, o.cy)}
				<circle
					cx={op.x}
					cy={op.y}
					r="2"
					fill="none"
					stroke={box.stroke}
					stroke-width="1"
					data-plot-element="box-outlier"
					role="graphics-symbol"
					aria-label={`outlier: ${o.value}`}
					onmouseenter={() => plotState.setHovered({ ...box.data, value: o.value })}
					onmouseleave={() => plotState.clearHovered()}
				/>
			{/each}
		{/each}
	</g>
{/if}
