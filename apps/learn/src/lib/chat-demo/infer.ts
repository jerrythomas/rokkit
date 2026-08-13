/**
 * Data → shape inference for the /chat data-upload demo.
 *
 * Given a parsed value (CSV → rows[], JSON → any), pick the best inline
 * rendering:
 *
 *   - single object        → editable form (schema auto-derived from fields)
 *   - array of records     → table (columns inferred from first row)
 *   - numeric series       → bar chart (x = categorical, y = numeric)
 *   - flat array           → list
 *   - other                → JSON code block as fallback
 *
 * The inference is intentionally simple — the goal is "show me something
 * useful from this data without me telling you the schema". An LLM with
 * the full DemoTool catalog can do better; this is the heuristic baseline.
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'unknown'

export type FieldSummary = {
	name: string
	type: FieldType
	/** % of non-null values (0..1) */
	density: number
	/** for numeric fields: min / max */
	min?: number
	max?: number
}

export type Inference =
	| { kind: 'record'; fields: FieldSummary[]; record: Record<string, unknown> }
	| { kind: 'table'; columns: FieldSummary[]; rows: Record<string, unknown>[] }
	| {
			kind: 'chart'
			columns: FieldSummary[]
			rows: Record<string, unknown>[]
			x: string
			y: string
			fill?: string
	  }
	| { kind: 'list'; items: unknown[] }
	| { kind: 'json'; value: unknown }
	| { kind: 'error'; message: string }

// ─── Type detection ─────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/
const NUMERIC_STRING_RE = /^-?\d+(\.\d+)?$/

function isNumericString(value: string): boolean {
	return NUMERIC_STRING_RE.test(value)
}

function isEmptyValue(value: unknown): boolean {
	return value === null || value === undefined || value === ''
}

function detectStringType(value: string): FieldType {
	if (DATE_RE.test(value)) return 'date'
	if (isNumericString(value)) return 'number'
	if (value === 'true' || value === 'false') return 'boolean'
	return 'string'
}

export function detectType(value: unknown): FieldType {
	if (isEmptyValue(value)) return 'unknown'
	if (typeof value === 'boolean') return 'boolean'
	if (typeof value === 'number') return Number.isFinite(value) ? 'number' : 'unknown'
	if (typeof value === 'string') return detectStringType(value)
	return 'unknown'
}

function coalesceTypes(types: FieldType[]): FieldType {
	const set = new Set(types.filter((t) => t !== 'unknown'))
	if (set.size === 0) return 'unknown'
	if (set.size === 1) return [...set][0]
	// mixed → fall back to string
	return 'string'
}

function summarizeColumn(rows: Record<string, unknown>[], name: string): FieldSummary {
	let nonNull = 0
	const types: FieldType[] = []
	let min = Infinity
	let max = -Infinity
	for (const row of rows) {
		const v = row[name]
		const t = detectType(v)
		if (t !== 'unknown') nonNull++
		types.push(t)
		if (t === 'number') {
			const n = typeof v === 'number' ? v : Number(v)
			if (n < min) min = n
			if (n > max) max = n
		}
	}
	const type = coalesceTypes(types)
	const summary: FieldSummary = {
		name,
		type,
		density: rows.length === 0 ? 0 : nonNull / rows.length
	}
	if (type === 'number' && min !== Infinity) {
		summary.min = min
		summary.max = max
	}
	return summary
}

// ─── CSV parsing ────────────────────────────────────────────────────────

type TokenizerState = {
	rows: string[][]
	field: string
	row: string[]
	inQuotes: boolean
}

/**
 * Advance past a character while inside a quoted field. Handles the
 * doubled-quote escape (`""` → literal `"`) and the closing quote.
 * Returns the (possibly advanced, to skip an escaped quote) index.
 */
function consumeQuotedChar(cleaned: string, i: number, state: TokenizerState): number {
	const c = cleaned[i]
	if (c !== '"') {
		state.field += c
		return i
	}
	if (cleaned[i + 1] === '"') {
		state.field += '"'
		return i + 1
	}
	state.inQuotes = false
	return i
}

/** Advance past a character outside any quoted field (field/row/quote-start delimiters). */
function consumeUnquotedChar(c: string, state: TokenizerState): void {
	if (c === '"') {
		state.inQuotes = true
	} else if (c === ',') {
		state.row.push(state.field)
		state.field = ''
	} else if (c === '\n') {
		state.row.push(state.field)
		state.rows.push(state.row)
		state.row = []
		state.field = ''
	} else {
		state.field += c
	}
}

/**
 * Character-by-character tokenizer for the CSV state machine: splits
 * newline-normalized text into rows of raw (still-quoted) string fields.
 */
function tokenizeCSV(cleaned: string): string[][] {
	const state: TokenizerState = { rows: [], field: '', row: [], inQuotes: false }
	for (let i = 0; i < cleaned.length; i++) {
		if (state.inQuotes) {
			i = consumeQuotedChar(cleaned, i, state)
		} else {
			consumeUnquotedChar(cleaned[i], state)
		}
	}
	state.row.push(state.field)
	if (state.row.length > 1 || state.row[0] !== '') state.rows.push(state.row)
	return state.rows
}

/** First row is the header; remaining rows become header-keyed objects. */
function rowsToObjects(rows: string[][]): Record<string, unknown>[] {
	if (rows.length === 0) return []
	const headers = rows[0]
	const out: Record<string, unknown>[] = []
	for (let r = 1; r < rows.length; r++) {
		const obj: Record<string, unknown> = {}
		for (let c = 0; c < headers.length; c++) {
			obj[headers[c]] = rows[r][c] ?? ''
		}
		out.push(obj)
	}
	return out
}

/** Coerce a single raw CSV string field into null / number / boolean / string. */
function coerceFieldValue(v: string): unknown {
	if (v === '') return null
	if (isNumericString(v)) return Number(v)
	if (v === 'true' || v === 'false') return v === 'true'
	return v
}

// Coerce numeric / boolean strings now so consumers don't have to.
function coerceRowTypes(rows: Record<string, unknown>[]): void {
	for (const row of rows) {
		for (const key of Object.keys(row)) {
			const v = row[key]
			if (typeof v !== 'string') continue
			row[key] = coerceFieldValue(v)
		}
	}
}

/**
 * Tiny RFC-4180-ish CSV parser. Handles quoted fields with commas and
 * doubled-up quotes (""). Doesn't try to be papaparse — just enough to
 * get a real-world CSV into rows.
 */
export function parseCSV(text: string): Record<string, unknown>[] {
	const cleaned = text.replace(/\r\n?/g, '\n').trim()
	if (!cleaned) return []
	const rows = tokenizeCSV(cleaned)
	const out = rowsToObjects(rows)
	coerceRowTypes(out)
	return out
}

// ─── Shape inference ────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function inferChartAxes(columns: FieldSummary[]): { x: string; y: string; fill?: string } | null {
	const categorical = columns.find((c) => c.type === 'string' || c.type === 'date')
	const numeric = columns.find((c) => c.type === 'number')
	if (!categorical || !numeric) return null
	const secondCategorical = columns.find(
		(c) => c !== categorical && (c.type === 'string' || c.type === 'date')
	)
	const out: { x: string; y: string; fill?: string } = {
		x: categorical.name,
		y: numeric.name
	}
	if (secondCategorical) out.fill = secondCategorical.name
	return out
}

/** Summarize every column of an array of records (union of all keys seen). */
function summarizeRows(rows: Record<string, unknown>[]): FieldSummary[] {
	const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
	return keys.map((k) => summarizeColumn(rows, k))
}

/** Field summary for each key of a single record (density is always 1 — the key is present). */
function buildRecordFields(value: Record<string, unknown>): FieldSummary[] {
	return Object.keys(value).map((k) => ({
		name: k,
		type: detectType(value[k]),
		density: 1
	}))
}

/**
 * Optional hint to override the auto-detection. If `force` is provided and
 * the data can plausibly fit that shape, we return that shape; otherwise we
 * fall back to the normal inference. Used by data-aware suggestions
 * ("Show as a table", "Chart Y by X").
 */
export function inferShape(
	value: unknown,
	force?: 'table' | 'chart' | 'record' | 'list'
): Inference {
	if (force === 'table' && Array.isArray(value) && value.every(isPlainObject)) {
		const rows = value as Record<string, unknown>[]
		return { kind: 'table', columns: summarizeRows(rows), rows }
	}
	if (force === 'chart' && Array.isArray(value) && value.every(isPlainObject)) {
		const rows = value as Record<string, unknown>[]
		const columns = summarizeRows(rows)
		const axes = inferChartAxes(columns)
		if (axes) return { kind: 'chart', columns, rows, ...axes }
		// Fall through to normal inference if we can't pick axes.
	}
	if (force === 'list' && Array.isArray(value)) {
		return { kind: 'list', items: value }
	}
	if (force === 'record' && isPlainObject(value)) {
		return { kind: 'record', fields: buildRecordFields(value), record: value }
	}
	return inferShapeAuto(value)
}

/**
 * Array of records → chart when there's a clean (categorical, numeric) pair
 * and the data isn't too big to plot legibly; otherwise a table. Array of
 * primitives (or empty) → list.
 */
function inferArrayShape(value: unknown[]): Inference {
	if (value.length === 0) return { kind: 'list', items: [] }
	if (!value.every(isPlainObject)) return { kind: 'list', items: value }
	const rows = value as Record<string, unknown>[]
	const columns = summarizeRows(rows)
	const axes = inferChartAxes(columns)
	// Chart if we have a clean (categorical, numeric) pair AND not too many
	// rows (charts get crowded). Threshold is conservative; user can always
	// ask for "show as a table" via prose later.
	if (axes && rows.length <= 60 && columns.length <= 4) {
		return { kind: 'chart', columns, rows, ...axes }
	}
	return { kind: 'table', columns, rows }
}

export function inferShapeAuto(value: unknown): Inference {
	// 1. Array of records → table or chart
	if (Array.isArray(value)) return inferArrayShape(value)
	// 2. Single object → editable form
	if (isPlainObject(value)) {
		return { kind: 'record', fields: buildRecordFields(value), record: value }
	}
	return { kind: 'json', value }
}

// ─── Schema generation from a single record ─────────────────────────────

/**
 * Build a JSON-Schema-ish object from a single record so FormRenderer can
 * present an editable view of arbitrary user data.
 */
export function schemaFromRecord(record: Record<string, unknown>): Record<string, unknown> {
	const properties: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(record)) {
		const t = detectType(value)
		if (t === 'number') properties[key] = { type: 'number' }
		else if (t === 'boolean') properties[key] = { type: 'boolean' }
		else if (t === 'date') properties[key] = { type: 'string', format: 'date' }
		else properties[key] = { type: 'string' }
	}
	return { type: 'object', properties }
}

// ─── Try-parse: JSON or CSV ─────────────────────────────────────────────

type ParseResult = { ok: true; value: unknown; format: 'json' | 'csv' } | { ok: false; error: string }

function tryParseJson(trimmed: string): ParseResult {
	try {
		return { ok: true, value: JSON.parse(trimmed), format: 'json' }
	} catch (e) {
		return { ok: false, error: `Invalid JSON: ${(e as Error).message}` }
	}
}

function tryParseCsv(trimmed: string): ParseResult {
	try {
		const rows = parseCSV(trimmed)
		if (rows.length === 0) return { ok: false, error: 'CSV parsed to no rows.' }
		return { ok: true, value: rows, format: 'csv' }
	} catch (e) {
		return { ok: false, error: `Invalid CSV: ${(e as Error).message}` }
	}
}

export function tryParse(text: string): ParseResult {
	const trimmed = text.trim()
	if (!trimmed) return { ok: false, error: 'Empty input.' }
	// JSON first: starts with { [ " or a digit
	if (/^[{[]/.test(trimmed)) return tryParseJson(trimmed)
	// Heuristic CSV: at least one comma and at least one newline
	if (trimmed.includes(',') && trimmed.includes('\n')) return tryParseCsv(trimmed)
	return { ok: false, error: 'Could not detect JSON or CSV.' }
}
