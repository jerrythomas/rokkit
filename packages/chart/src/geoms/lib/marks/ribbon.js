import { resolveAlpha } from '../aesthetics.js'
import { literalColor } from '../../../lib/brewing/colors.js'

/**
 * Build a Sankey-style ribbon layout: links (flows) + source/target node boxes. Link fill
 * comes from the source (then target) palette entry; `alpha` is fixed (default 0.5). Returns
 * an object rather than a flat array, so the geom template renders links + node labels.
 * @param {{ data: any[], plot: any, channels?: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildRibbonMarks({ data, plot, channels = {}, options = {}, alpha, type = 'ribbon' }) {
	const empty = { links: [], sourceNodes: [], targetNodes: [] }
	if (!data?.length) return empty

	const { colors, innerHeight, innerWidth } = plot
	const sourceField = options.source ?? 'source'
	const targetField = options.target ?? 'target'
	const valueField = options.value ?? 'value'
	// A literal color/fill paints every ribbon directly (else fill comes from the node palette).
	const lit = literalColor(channels.color ?? channels.fill)
	const a = resolveAlpha(alpha, type, plot.chartPreset)

	const flows = data.map((d) => ({
		source: String(d[sourceField]),
		target: String(d[targetField]),
		value: Number(d[valueField]) || 0,
		data: d
	}))

	const sourceMap = new Map()
	const targetMap = new Map()
	for (const f of flows) {
		sourceMap.set(f.source, (sourceMap.get(f.source) ?? 0) + f.value)
		targetMap.set(f.target, (targetMap.get(f.target) ?? 0) + f.value)
	}

	const totalSource = Math.max(1, [...sourceMap.values()].reduce((s, v) => s + v, 0))
	const totalTarget = Math.max(1, [...targetMap.values()].reduce((s, v) => s + v, 0))
	const padding = 4
	const availHeight = innerHeight - padding * (Math.max(sourceMap.size, targetMap.size) - 1)

	let sourceY = 0
	const sourceNodes = []
	for (const [name, value] of sourceMap) {
		const h = (value / totalSource) * availHeight
		sourceNodes.push({ name, y: sourceY, height: h })
		sourceY += h + padding
	}

	let targetY = 0
	const targetNodes = []
	for (const [name, value] of targetMap) {
		const h = (value / totalTarget) * availHeight
		targetNodes.push({ name, y: targetY, height: h })
		targetY += h + padding
	}

	const sourceOffsets = new Map(sourceNodes.map((n) => [n.name, n.y]))
	const targetOffsets = new Map(targetNodes.map((n) => [n.name, n.y]))
	const x0 = 0
	const x1 = innerWidth

	const links = flows.map((f, i) => {
		const sy0 = sourceOffsets.get(f.source) ?? 0
		const ty0 = targetOffsets.get(f.target) ?? 0
		const sourceTotal = sourceMap.get(f.source) ?? 1
		const targetTotal = targetMap.get(f.target) ?? 1
		const sh = (f.value / sourceTotal) * (sourceNodes.find((n) => n.name === f.source)?.height ?? 0)
		const th = (f.value / targetTotal) * (targetNodes.find((n) => n.name === f.target)?.height ?? 0)

		const path = `M${x0},${sy0} C${innerWidth * 0.4},${sy0} ${innerWidth * 0.6},${ty0} ${x1},${ty0} L${x1},${ty0 + th} C${innerWidth * 0.6},${ty0 + th} ${innerWidth * 0.4},${sy0 + sh} ${x0},${sy0 + sh} Z`

		sourceOffsets.set(f.source, sy0 + sh)
		targetOffsets.set(f.target, ty0 + th)

		const fill = lit ?? (colors?.get(f.source)?.fill ?? colors?.get(f.target)?.fill ?? '#888')
		return { key: `ribbon-${i}`, d: path, fill, alpha: a, data: f.data }
	})

	return { links, sourceNodes, targetNodes }
}
