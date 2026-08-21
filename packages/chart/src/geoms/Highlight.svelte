<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { resolveHighlight } from '../lib/highlight.js'
	import { scalePos } from '../lib/scale.js'
	import { resolveLabel } from './lib/aesthetics.js'

	type Row = Record<string, unknown>
	type Props = {
		x?: string
		y?: string
		highlight?: 'first' | 'last' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
		label?: boolean | string | ((row: Row) => unknown)
	}
	let { x, y, highlight = undefined, label = false }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	type Mark = { key: string; cx: number; cy: number; row: Row; selected: boolean }
	/** Everything both mark builders need, resolved once per derivation. */
	type Ctx = {
		rows: Row[]
		selectedRows: Row[]
		// Scales come from PlotState (untyped JS), so they stay loose here.
		xs: (v: unknown) => number
		ys: (v: number) => number
		x: string
		y: string
	}

	const hasScales = (s: PlotState | undefined) => Boolean(s?.xScale && s?.yScale)

	/** Null until the plot has both scales and both channels — nothing can be placed before then. */
	const ctx = $derived.by((): Ctx | null => {
		if (!hasScales(state) || !x || !y) return null
		return {
			rows: state.data ?? [],
			selectedRows: state.selectedRows ?? [],
			xs: state.xScale,
			ys: state.yScale,
			x,
			y
		}
	})

	const place = (c: Ctx, row: Row) => ({
		cx: scalePos(c.xs, row[c.x]),
		cy: c.ys(Number(row[c.y]))
	})

	/** Marks for the declarative `highlight` selector. */
	function highlightMarks(c: Ctx, selector: Props['highlight']): Mark[] {
		if (selector === null || selector === undefined) return []
		const selected = new Set(c.selectedRows)
		return resolveHighlight(c.rows, selector, { y: c.y }).map((i) => ({
			key: `h${i}`,
			...place(c, c.rows[i]),
			row: c.rows[i],
			// A statically-highlighted point that is also selected renders as
			// selected — selection is the stronger, interactive state.
			selected: selected.has(c.rows[i])
		}))
	}

	/** Marks for interactive selection, minus any row a highlight mark already covers. */
	function selectionMarks(c: Ctx, covered: Set<Row>): Mark[] {
		return c.selectedRows
			.map((row, j) => ({ row, j }))
			.filter(({ row }) => !covered.has(row))
			.map(({ row, j }) => ({ key: `s${j}`, ...place(c, row), row, selected: true }))
	}

	const isPlaced = (m: Mark) => Number.isFinite(m.cx) && Number.isFinite(m.cy)

	const marks = $derived.by(() => {
		if (!ctx) return []
		const highlighted = highlightMarks(ctx, highlight)
		// Derived from the marks just built, so "already emitted" has one source of truth.
		const selected = selectionMarks(ctx, new Set(highlighted.map((m) => m.row)))
		return [...highlighted, ...selected].filter(isPlaced)
	})
</script>

{#if marks.length}
	<g data-plot-geom="highlight">
		{#each marks as m (m.key)}
			<circle
				cx={m.cx}
				cy={m.cy}
				data-plot-highlight
				data-plot-selected={m.selected ? 'true' : undefined}
			/>
			{#if label}
				{@const text = resolveLabel(label, m.row, y)}
				{#if text}
					<text x={m.cx} y={m.cy} dy="-8" text-anchor="middle" data-plot-highlight-label
						>{text}</text
					>
				{/if}
			{/if}
		{/each}
	</g>
{/if}

<style>
	[data-plot-highlight] {
		fill: var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12)));
		stroke: var(--chart-highlight-ring, none);
		r: var(--chart-highlight-radius, 4);
		/* Visual only — let clicks pass through to the data hit target beneath so the
		   highlighted/selected observation stays selectable (and de-selectable). */
		pointer-events: none;
	}
	[data-plot-highlight-label] {
		fill: currentColor;
		font-size: 11px;
	}
	[data-plot-highlight][data-plot-selected='true'] {
		stroke: var(
			--chart-selected-ring,
			var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12)))
		);
		stroke-width: var(--chart-selected-ring-width, 2);
		fill: var(--chart-selected-fill, var(--color-paper, #fff));
	}
</style>
