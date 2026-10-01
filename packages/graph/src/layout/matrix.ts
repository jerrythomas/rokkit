/* The dependency structure matrix (DSM): every node is both a row and a column, and a cell at
 * (row, col) says "row depends on col".
 *
 * Its strength is the ORDER. Providers come first, so in a layered architecture every
 * dependency points up-and-left and the whole matrix is lower-triangular. A mark ABOVE the
 * diagonal is then a dependency against the grain — a cycle, or a layer that reaches up —
 * and it is visible at a glance at sizes where a node-link drawing is a hairball.
 *
 * The order reuses `flow`'s ranking (longest path, DFS cycle breaking), reversed: `rank` puts
 * a target in a later column than its source, and a DSM wants the target FIRST. Grouping keeps
 * each group contiguous, ordered by where its first member ranks, so a module's block sits on
 * the diagonal and a cross-module dependency against the grain lands above it.
 *
 * Pure and DOM-free, like every layout.
 */

import { counted, say } from '../messages.js'
import { rank } from './rank.js'
import type { NodeAxis } from './types.js'
import type { GraphModel, GraphNode } from '../types.js'

export type MatrixCell = {
	/** Index into `order` of the dependent (the edge's source). */
	row: number
	/** Index into `order` of the dependency (the edge's target). */
	col: number
	source: string
	target: string
	/** Edges folded into this cell — two FKs, a read and a write — each counted by its weight. */
	count: number
	/** Against the grain: a cycle or a layer reaching up. */
	above: boolean
}

export type MatrixBlock = { name: string; start: number; end: number }

export type Matrix = {
	/** Node ids, providers first. Row i and column i are the same node. */
	order: string[]
	labels: string[]
	/** Each node's group key on the grouping axis, parallel to `order` ('' when ungrouped). */
	groups: string[]
	cells: MatrixCell[]
	/** Contiguous group runs along the diagonal. Empty when not grouping. */
	blocks: MatrixBlock[]
	/** Cells above the diagonal. */
	above: number
	/** The largest `count`, for scaling cell intensity. */
	maxCount: number
}

export type MatrixOptions = {
	/** Keep each group contiguous and outline it on the diagonal. Omit for one flat order. */
	groupBy?: NodeAxis
}

const axisOf = (node: GraphNode, axis: NodeAxis) => (axis === 'kind' ? node.kind : node.group) ?? ''

/** Node ids, providers first; with `groupBy`, each group contiguous in first-ranked order. */
function orderNodes(model: GraphModel, groupBy: NodeAxis | undefined): GraphNode[] {
	const { ranks } = rank(model)
	// `rank` places every node, so each lookup hits; carrying the model index alongside the
	// rank keeps ties in model order without a second map.
	const byRank = model.nodes
		.map((node, i) => ({ node, i, r: ranks.get(node.id) as number }))
		.sort((a, b) => b.r - a.r || a.i - b.i)
		.map((entry) => entry.node)
	if (!groupBy) return byRank

	const runs = new Map<string, GraphNode[]>()
	for (const node of byRank) {
		const key = axisOf(node, groupBy)
		const run = runs.get(key) ?? []
		run.push(node)
		runs.set(key, run)
	}
	return [...runs.values()].flat()
}

function blocksOf(groups: string[]): MatrixBlock[] {
	const blocks: MatrixBlock[] = []
	groups.forEach((name, i) => {
		const last = blocks[blocks.length - 1]
		if (last && last.name === name) last.end = i
		else blocks.push({ name, start: i, end: i })
	})
	return blocks
}

/** One cell per (dependent, dependency) pair, parallel edges folded into its count. */
function collectCells(model: GraphModel, index: Map<string, number>): MatrixCell[] {
	const cells = new Map<string, MatrixCell>()
	for (const edge of model.edges) {
		const row = index.get(edge.source)
		const col = index.get(edge.target)
		if (row === undefined || col === undefined || row === col) continue
		const key = `${row}:${col}`
		// A weighted edge already IS a count — an import list aggregated to components says
		// "7 imports" once rather than repeating the edge seven times.
		const n = edge.weight ?? 1
		const cell = cells.get(key)
		if (cell) cell.count += n
		else
			cells.set(key, {
				row,
				col,
				source: edge.source,
				target: edge.target,
				count: n,
				above: col > row
			})
	}
	return [...cells.values()].sort((a, b) => a.row - b.row || a.col - b.col)
}

export function buildMatrix(model: GraphModel, options: MatrixOptions = {}): Matrix {
	const nodes = orderNodes(model, options.groupBy)
	const index = new Map(nodes.map((n, i) => [n.id, i]))

	const cells = collectCells(model, index)
	const groups = nodes.map((n) => (options.groupBy ? axisOf(n, options.groupBy) : ''))

	return {
		order: nodes.map((n) => n.id),
		labels: nodes.map((n) => n.label),
		groups,
		cells,
		blocks: options.groupBy ? blocksOf(groups) : [],
		above: cells.filter((c) => c.above).length,
		maxCount: Math.max(0, ...cells.map((c) => c.count))
	}
}

/** The matrix's frame: a label gutter sized by the longest name (by length, not the DOM —
 *  deterministic, like every layout here), and the canvas around `n` cells of `cell` px. */
export function matrixFrame(
	matrix: Pick<Matrix, 'labels' | 'order'>,
	cell: number
): { labelW: number; n: number; width: number; height: number } {
	const longest = Math.max(0, ...matrix.labels.map((label) => label.length))
	const labelW = Math.min(220, Math.max(48, longest * 6.5 + 14))
	const n = matrix.order.length
	const side = labelW + n * cell + 8
	return { labelW, n, width: side, height: side }
}

/** A cell on the selected node's row or column is highlighted; nothing is without a selection. */
export const cellState = (selected: string | null, source: string, target: string) =>
	selected && (source === selected || target === selected) ? 'highlight' : undefined

/** The matrix's accessible name: what it holds, from the locale. */
export function matrixLabel(nodes: number, dependencies: number, above: number): string {
	return say('matrix', {
		nodes: counted(nodes, 'nodeOne', 'nodeMany'),
		dependencies: counted(dependencies, 'dependencyOne', 'dependencyMany'),
		above
	})
}
