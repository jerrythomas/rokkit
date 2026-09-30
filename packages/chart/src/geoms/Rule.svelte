<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { clipAbline, slopeLabel } from '../lib/abline.js'

	type RuleValue = number | string
	type Props = {
		/** Vertical reference line(s) at these x-axis value(s) (a value, or a band category). */
		x?: RuleValue | RuleValue[]
		/** Horizontal reference line(s) at these y-axis value(s). */
		y?: RuleValue | RuleValue[]
		/**
		 * A sloped line `y = slope·x + intercept` (ggplot's `abline`), clipped to the visible
		 * domain. Continuous axes only — a slope over categories has no meaning, so it is
		 * ignored on a band axis. The main sequence is `slope={-1} intercept={1}`.
		 */
		slope?: number
		/** Where the sloped line crosses x = 0. Defaults to 0. */
		intercept?: number
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
		slope = undefined,
		intercept = 0,
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
	function axisPos(
		scale: { (v: unknown): number | undefined; bandwidth?: () => number },
		v: unknown
	) {
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

	type Point = { x: number; y: number }
	type RuleLine = {
		key: string
		x1: number
		y1: number
		x2: number
		y2: number
		value: RuleValue
		text: string | null
		kind: 'x' | 'y' | 'slope'
	}

	const lineOf = (id: Pick<RuleLine, 'key' | 'kind' | 'value'>, a: Point, b: Point): RuleLine => ({
		...id,
		x1: a.x,
		y1: a.y,
		x2: b.x,
		y2: b.y,
		text: labelFor(id.value)
	})

	type AnyScale = {
		(v: unknown): number | undefined
		bandwidth?: () => number
		domain: () => unknown[]
	}
	const isBand = (scale: AnyScale) => typeof scale.bandwidth === 'function'

	// The sloped line, clipped in DATA space so it stays inside the plot at any zoom. A band
	// axis has no numeric domain to clip against, so the slope is ignored there.
	function slopeLine(
		xs: AnyScale,
		ys: AnyScale,
		place: (u: number, v: number) => Point
	): RuleLine | null {
		if (slope === undefined || isBand(xs) || isBand(ys)) return null
		const seg = clipAbline(
			slope,
			intercept,
			xs.domain() as [number, number],
			ys.domain() as [number, number]
		)
		if (!seg) return null
		const a = place(Number(xs(seg.x1)), Number(ys(seg.y1)))
		const b = place(Number(xs(seg.x2)), Number(ys(seg.y2)))
		return lineOf({ key: `slope-${slope}-${intercept}`, kind: 'slope', value: slope }, a, b)
	}

	// Each rule is expressed in (x-channel, y-channel) space and placed to screen, so it
	// transposes under orientation flip: a y-value reference is horizontal when vertical and
	// vertical when flipped (it stays perpendicular to the value axis).
	const rules = $derived.by((): RuleLine[] => {
		if (!xScale || !yScale) return []
		const place = plotState.place.bind(plotState)
		const [xLo, xHi] = axisExtent(xScale)
		const [yLo, yHi] = axisExtent(yScale)
		const horizontal = toArray(y).map((yv) => {
			const yc = axisPos(yScale, yv)
			return lineOf({ key: `y-${yv}`, kind: 'y', value: yv }, place(xLo, yc), place(xHi, yc))
		})
		const vertical = toArray(x).map((xv) => {
			const xc = axisPos(xScale, xv)
			return lineOf({ key: `x-${xv}`, kind: 'x', value: xv }, place(xc, yLo), place(xc, yHi))
		})
		const sloped = slopeLine(xScale, yScale, place)
		return sloped ? [...horizontal, ...vertical, sloped] : [...horizontal, ...vertical]
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
				data-plot-rule={rule.kind}
				data-plot-value={rule.value}
			/>
			{#if rule.text && rule.kind === 'slope'}
				{@const at = slopeLabel(rule)}
				<text
					x={at.x}
					y={at.y}
					dy="-5"
					text-anchor="middle"
					transform="rotate({at.angle} {at.x} {at.y})"
					font-size="10"
					fill={strokeColor}
					data-plot-element="rule-label">{rule.text}</text
				>
			{:else if rule.text}
				<text
					x={rule.x2}
					y={rule.y2}
					dx="-4"
					dy="-4"
					text-anchor="end"
					font-size="10"
					fill={strokeColor}
					data-plot-element="rule-label">{rule.text}</text
				>
			{/if}
		{/each}
	</g>
{/if}
