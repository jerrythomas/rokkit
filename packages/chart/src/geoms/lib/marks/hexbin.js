import { resolveAlpha } from '../aesthetics.js'

/** SVG path for a pointy-top hexagon of radius r, centered at the origin. */
export function hexPath(r) {
	const angles = [0, 1, 2, 3, 4, 5].map((i) => ((i * 60 - 30) * Math.PI) / 180)
	return `${angles.map((a, i) => `${i === 0 ? 'M' : 'L'}${r * Math.cos(a)},${r * Math.sin(a)}`).join('')}Z`
}

/** Group points into hexagonal bins and count per bin. */
function hexBin(rows, xField, yField, xScale, yScale, r) {
	const dx = r * 2 * Math.sin(Math.PI / 3)
	const dy = r * 1.5
	const bins = new Map()
	for (const d of rows) {
		const px = xScale(d[xField ?? ''])
		const py = yScale(d[yField ?? ''])
		if (px === null || px === undefined || py === null || py === undefined) continue
		const col = Math.round(px / dx)
		const row = Math.round(py / dy)
		const cx = col * dx + (row % 2 ? dx / 2 : 0)
		const cy = row * dy
		const key = `${col},${row}`
		let bin = bins.get(key)
		if (!bin) {
			bin = { cx, cy, count: 0, points: [] }
			bins.set(key, bin)
		}
		bin.count++
		bin.points.push(d)
	}
	return [...bins.values()]
}

/**
 * Build renderable hex bins. Fill is the continuous color scale (by count) or a density-ramp
 * rgba fallback. `alpha` is a flat multiplier on top (default 1 → unchanged).
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildHexbinMarks({ data, plot, channels, options = {}, alpha, type = 'hexbin' }) {
	const { xScale, yScale } = plot
	if (!data?.length || !xScale || !yScale) return []

	const radius = options.radius ?? 20
	const bins = hexBin(data, channels.x, channels.y, xScale, yScale, radius)
	const maxCount = Math.max(1, ...bins.map((b) => b.count))
	const colorScale = plot.continuousColorScale?.scale
	const a = resolveAlpha(alpha, type, plot.chartPreset)

	return bins.map((bin, i) => ({
		key: `hex-${i}`,
		cx: bin.cx,
		cy: bin.cy,
		count: bin.count,
		fill: colorScale
			? colorScale(bin.count)
			: `rgba(66, 133, 244, ${0.1 + 0.9 * (bin.count / maxCount)})`,
		alpha: a,
		value: bin.count,
		display: `${bin.count}`,
		data: { count: bin.count, x: bin.cx, y: bin.cy }
	}))
}
