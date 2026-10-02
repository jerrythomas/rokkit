/* Pasted or uploaded data enters the same engine as a message: its shape is inferred, and the
 * reply is a `reshape` of it into that shape's view, so the data becomes the screen and every
 * follow-up ("make it striped", "as a chart") works on it.
 */
import type { Block } from '../types'
import { inferShapeAuto, type FieldSummary, type Inference } from '../infer'
import type { View } from './types'
import { act } from './act'

const VIEW_OF: Partial<Record<Inference['kind'], View>> = { table: 'table', chart: 'chart', record: 'form', list: 'list' }

const HEADLINE: Record<string, string> = {
	record: 'A single record — shown as an editable form, its schema inferred from the value types.',
	table: 'Tabular data — a sortable table, its columns inferred from the rows.',
	chart: 'A categorical and a numeric column — charted, the first as x and the second as y.',
	list: 'A flat list — one item per entry.',
	json: 'No structured shape to infer, so here it is as JSON.'
}

function columnsOf(inf: Inference): FieldSummary[] {
	if (inf.kind === 'record') return inf.fields
	if (inf.kind === 'table' || inf.kind === 'chart') return inf.columns
	return []
}

function note(inf: Inference, source: 'json' | 'csv'): Block {
	const columns = columnsOf(inf)
	const rowCount = 'rows' in inf ? inf.rows.length : inf.kind === 'list' ? inf.items.length : undefined
	return {
		kind: 'data-note',
		source,
		shape: inf.kind === 'error' ? 'json' : inf.kind,
		rowCount,
		columnCount: columns.length || undefined,
		columns: columns.length ? columns.map((c) => ({ name: c.name, type: c.type })) : undefined
	}
}

const lead = (kind: string, query?: string): Block => ({
	kind: 'prose',
	text: query?.trim() ? `For "${query.trim()}" — ${HEADLINE[kind].toLowerCase()}` : HEADLINE[kind]
})

export function pastedBlocks(source: 'json' | 'csv', parsed: unknown, query?: string): Block[] {
	let inf: Inference
	try {
		inf = inferShapeAuto(parsed)
	} catch (err) {
		return [{ kind: 'prose', text: `Could not read the data — ${(err as Error).message}` }]
	}
	if (inf.kind === 'error') return [{ kind: 'prose', text: `Could not read the data — ${inf.message}` }]
	const view = VIEW_OF[inf.kind]
	if (!view) return [lead('json', query), { kind: 'code', language: 'json', filename: 'data.json', code: JSON.stringify(parsed, null, 2) }]
	// `act` writes its own line ("Your 6 rows, as a table."); the shape headline replaces it.
	const [, ...reply] = act({ intent: 'reshape', view, confidence: 1 }, { demo: 'pasted', props: {}, data: parsed })
	return [lead(inf.kind, query), note(inf, source), ...reply]
}
