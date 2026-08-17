<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'

	type RuleValue = number | string
	type Props = {
		/** Vertical reference line(s) at these x-axis value(s) (a value, or a band category). */
		x?: RuleValue | RuleValue[]
		/** Horizontal reference line(s) at these y-axis value(s). */
		y?: RuleValue | RuleValue[]
		/** Line color (aligns with the other geoms' `color` aesthetic). */
		color?: string
		/** @deprecated use `color` — kept as an alias. */
		stroke?: string
		/** SVG stroke-dasharray (default dashed). Pass '' for a solid line. */
		dash?: string
		strokeWidth?: number
		/** Optional label drawn at the line's end. String, or a fn of the value. */
		label?: string | ((value: RuleValue) => string)
	}

	let {
		x,
		y,
		color = undefined,
		stroke = undefined,
		dash = '4 4',
		strokeWidth = 1,
		label = undefined
	}: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)

	const toArray = (v: RuleValue | RuleValue[] | undefined): RuleValue[] =>
		v === undefined ? [] : Array.isArray(v) ? v : [v]

	// Position along an axis: band scales resolve to the band centre, linear scales map directly.
	function axisPos(scale: { (v: unknown): number | undefined; bandwidth?: () => number }, v: unknown) {
		const base = scale(v) ?? 0
		return typeof scale.bandwidth === 'function' ? base + scale.bandwidth() / 2 : base
	}
	// The full [min, max] screen extent of a scale's range (spans the perpendicular axis).
	function axisExtent(scale: { range: () => number[] }) {
		const r = scale.range()
		return [Math.min(...r), Math.max(...r)]
	}

	const labelFor = (v: RuleValue) =>
		typeof label === 'function' ? label(v) : typeof label === 'string' ? label : null

	// Each rule is expressed in (x-channel, y-channel) space and placed to screen, so it
	// transposes under orientation flip: a y-value reference is horizontal when vertical and
	// vertical when flipped (it stays perpendicular to the value axis).
	const rules = $derived.by(() => {
		if (!xScale || !yScale) return []
		const place = plotState.place.bind(plotState)
		const out: Array<{
			key: string
			x1: number
			y1: number
			x2: number
			y2: number
			value: RuleValue
			text: string | null
		}> = []
		const [xLo, xHi] = axisExtent(xScale)
		const [yLo, yHi] = axisExtent(yScale)

		for (const yv of toArray(y)) {
			const yc = axisPos(yScale, yv)
			const a = place(xLo, yc)
			const b = place(xHi, yc)
			out.push({ key: `y-${yv}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, value: yv, text: labelFor(yv) })
		}
		for (const xv of toArray(x)) {
			const xc = axisPos(xScale, xv)
			const a = place(xc, yLo)
			const b = place(xc, yHi)
			out.push({ key: `x-${xv}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, value: xv, text: labelFor(xv) })
		}
		return out
	})

	const strokeColor = $derived(color ?? stroke ?? 'currentColor')
</script>

{#if rules.length > 0}
	<g data-plot-geom="rule">
		{#each rules as rule (rule.key)}
			<line
				x1={rule.x1}
				y1={rule.y1}
				x2={rule.x2}
				y2={rule.y2}
				stroke={strokeColor}
				stroke-width={strokeWidth}
				stroke-dasharray={dash || undefined}
				data-plot-element="rule"
				data-plot-value={rule.value}
			/>
			{#if rule.text}
				<text
					x={rule.x2}
					y={rule.y2}
					dx="-4"
					dy="-4"
					text-anchor="end"
					font-size="10"
					fill={strokeColor}
					data-plot-element="rule-label"
				>{rule.text}</text>
			{/if}
		{/each}
	</g>
{/if}
