<script lang="ts">
	/**
	 * The dependency structure matrix: every node a row and a column, a cell where the row
	 * depends on the column.
	 *
	 * Providers come first, so a layered codebase is lower-triangular and a mark ABOVE the
	 * diagonal is a dependency against the grain — a cycle, or a layer reaching up. Groups sit
	 * on the diagonal as outlined blocks, so a cross-module violation is a mark outside its
	 * block. It stays readable at sizes where a node-link drawing is a hairball, which is the
	 * reason to reach for it.
	 *
	 * Share a `state` with a `DependencyDiagram` beside it and a row click selects the same
	 * node in both.
	 */
	import { GraphState } from '../GraphState.svelte.js'
	import { buildMatrix } from '../layout/matrix.js'
	import type { NodeAxis } from '../layout/types.js'
	import type { GraphFields } from '../types.js'

	type Props = {
		/** Share one state with another view. The caller owns it; this component never updates it. */
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		/** Keep each group contiguous and outline it on the diagonal. `null` for one flat order. */
		groupBy?: NodeAxis | null
		/** Cell size in pixels. */
		cell?: number
		value?: string | null
		label?: string
		onselect?: (id: string | null) => void
		class?: string
	}

	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		groupBy = 'group',
		cell = 16,
		value = $bindable(undefined),
		label = undefined,
		onselect = undefined,
		class: className = ''
	}: Props = $props()

	const config = () => ({
		nodes,
		edges,
		fields,
		value,
		onselect: (id: string | null) => {
			value = id
			onselect?.(id)
		}
	})

	// svelte-ignore state_referenced_locally
	const graph = provided ?? new GraphState(config())

	$effect(() => {
		if (!provided) graph.update(config())
	})

	const matrix = $derived(buildMatrix(graph.model, { groupBy: groupBy ?? undefined }))

	// Labels are measured by length, not by the DOM — deterministic, like every layout here.
	const labelW = $derived(
		Math.min(220, Math.max(48, Math.max(0, ...matrix.labels.map((l) => l.length)) * 6.5 + 14))
	)
	const n = $derived(matrix.order.length)
	const width = $derived(labelW + n * cell + 8)
	const height = $derived(labelW + n * cell + 8)
	const selected = $derived(graph.value)

	const name = $derived(
		label ??
			`Dependency matrix: ${n} nodes, ${matrix.cells.length} dependencies, ${matrix.above} above the diagonal`
	)

	function toggle(id: string) {
		if (selected === id) graph.clear()
		else graph.select(id)
	}

	function onKey(event: KeyboardEvent, id: string) {
		if (event.key !== 'Enter' && event.key !== ' ') return
		event.preventDefault()
		toggle(id)
	}

	const cellState = (source: string, target: string) =>
		selected && (source === selected || target === selected) ? 'highlight' : undefined
</script>

<div data-graph-matrix class={className} role="group" aria-label={name}>
	<svg {width} {height} viewBox="0 0 {width} {height}">
		<!-- Column headings, rotated so a long name costs height rather than width. -->
		{#each matrix.labels as text, i (matrix.order[i])}
			<text
				data-matrix-col={matrix.order[i]}
				data-matrix-state={selected === matrix.order[i] ? 'selected' : undefined}
				transform="translate({labelW + i * cell + cell / 2 + 4}, {labelW - 6}) rotate(-90)"
				>{text}</text
			>
		{/each}

		{#each matrix.labels as text, i (matrix.order[i])}
			{@const id = matrix.order[i]}
			<g
				data-matrix-row={id}
				data-matrix-state={selected === id ? 'selected' : undefined}
				role="button"
				tabindex="0"
				aria-pressed={selected === id}
				aria-label={text}
				onclick={() => toggle(id)}
				onkeydown={(event) => onKey(event, id)}
			>
				<rect
					x="0"
					y={labelW + i * cell}
					width={labelW + n * cell}
					height={cell}
					data-matrix-band
				/>
				<text
					x={labelW - 6}
					y={labelW + i * cell + cell / 2}
					text-anchor="end"
					dominant-baseline="middle">{text}</text
				>
			</g>
		{/each}

		{#each matrix.order as id, i (id)}
			<rect
				data-matrix-diagonal
				x={labelW + i * cell}
				y={labelW + i * cell}
				width={cell}
				height={cell}
			/>
		{/each}

		{#each matrix.cells as c (`${c.row}:${c.col}`)}
			<g
				data-matrix-cell
				data-matrix-from={c.source}
				data-matrix-to={c.target}
				data-matrix-above={c.above ? '' : undefined}
				data-matrix-state={cellState(c.source, c.target)}
				style:--cell-weight={c.count / matrix.maxCount}
			>
				<rect
					x={labelW + c.col * cell + 1}
					y={labelW + c.row * cell + 1}
					width={cell}
					height={cell}
				/>
				<title>{c.source} → {c.target} ({c.count})</title>
			</g>
		{/each}

		{#each matrix.blocks as b (b.name + b.start)}
			<rect
				data-matrix-block={b.name}
				x={labelW + b.start * cell}
				y={labelW + b.start * cell}
				width={(b.end - b.start + 1) * cell}
				height={(b.end - b.start + 1) * cell}
			/>
		{/each}
	</svg>
</div>
