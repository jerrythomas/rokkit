import type { GraphModel } from '../types.js'

export type EntityRow = {
	id: string
	label: string
	group?: string
	kind?: string
	rowCount: number
	refCount: number
	note?: string
}

/** One row per node for an entity list: its rows and the structural edges touching it. */
export function entityRows(model: GraphModel): EntityRow[] {
	return model.nodes.map((node) => ({
		id: node.id,
		label: node.label,
		group: node.group,
		kind: node.kind,
		rowCount: node.rows.length,
		refCount: model.edges.filter((e) => e.source === node.id || e.target === node.id).length,
		note: node.note
	}))
}
