import { describe, it, expect } from 'vitest'
import {
	parseCSV,
	tryParse,
	inferShape,
	inferShapeAuto,
	detectType,
	schemaFromRecord
} from '../../src/lib/chat-demo/infer'

// ─── detectType ─────────────────────────────────────────────────────────

describe('detectType', () => {
	it('treats null, undefined, and empty string as unknown', () => {
		expect(detectType(null)).toBe('unknown')
		expect(detectType(undefined)).toBe('unknown')
		expect(detectType('')).toBe('unknown')
	})

	it('detects booleans (real and stringified)', () => {
		expect(detectType(true)).toBe('boolean')
		expect(detectType(false)).toBe('boolean')
		expect(detectType('true')).toBe('boolean')
		expect(detectType('false')).toBe('boolean')
	})

	it('detects finite numbers, and treats non-finite numbers as unknown', () => {
		expect(detectType(42)).toBe('number')
		expect(detectType(-5)).toBe('number')
		expect(detectType(3.14)).toBe('number')
		expect(detectType(NaN)).toBe('unknown')
		expect(detectType(Infinity)).toBe('unknown')
		expect(detectType(-Infinity)).toBe('unknown')
	})

	it('detects numeric strings', () => {
		expect(detectType('42')).toBe('number')
		expect(detectType('-42')).toBe('number')
		expect(detectType('3.14')).toBe('number')
	})

	it('detects ISO-ish date strings in several formats', () => {
		expect(detectType('2024-01-15')).toBe('date')
		expect(detectType('2024-01-15T10:30')).toBe('date')
		expect(detectType('2024-01-15T10:30:00')).toBe('date')
		expect(detectType('2024-01-15T10:30:00.123Z')).toBe('date')
		expect(detectType('2024-01-15T10:30:00+05:00')).toBe('date')
		expect(detectType('2024-01-15T10:30:00+0500')).toBe('date')
	})

	it('falls back to string for non-matching date-ish or plain text', () => {
		expect(detectType('2024-1-5')).toBe('string')
		expect(detectType('hello')).toBe('string')
	})

	it('treats objects, arrays, functions, symbols, and bigints as unknown', () => {
		expect(detectType({})).toBe('unknown')
		expect(detectType([])).toBe('unknown')
		expect(detectType(() => {})).toBe('unknown')
		expect(detectType(Symbol('x'))).toBe('unknown')
		expect(detectType(BigInt(10))).toBe('unknown')
	})
})

// ─── parseCSV ───────────────────────────────────────────────────────────

describe('parseCSV', () => {
	it('returns an empty array for empty or whitespace-only input', () => {
		expect(parseCSV('')).toEqual([])
		expect(parseCSV('   \n  ')).toEqual([])
	})

	it('parses a simple CSV with header row, coercing numeric fields', () => {
		expect(parseCSV('name,age\nAlice,30\nBob,25')).toEqual([
			{ name: 'Alice', age: 30 },
			{ name: 'Bob', age: 25 }
		])
	})

	it('handles quoted fields containing commas', () => {
		expect(parseCSV('name,note\n"Smith, John",hello')).toEqual([{ name: 'Smith, John', note: 'hello' }])
	})

	it('unescapes doubled quotes inside quoted fields', () => {
		expect(parseCSV('name\n"She said ""hi"""')).toEqual([{ name: 'She said "hi"' }])
	})

	it('normalizes CRLF line endings', () => {
		expect(parseCSV('a,b\r\n1,2\r\n')).toEqual([{ a: 1, b: 2 }])
	})

	it('ignores a trailing newline after the last data row', () => {
		expect(parseCSV('a,b\n1,2\n')).toEqual([{ a: 1, b: 2 }])
	})

	it('coerces "true"/"false" strings to booleans', () => {
		expect(parseCSV('flag\ntrue\nfalse')).toEqual([{ flag: true }, { flag: false }])
	})

	it('coerces empty fields to null', () => {
		expect(parseCSV('a,b\n1,\n2,3')).toEqual([
			{ a: 1, b: null },
			{ a: 2, b: 3 }
		])
		expect(parseCSV('a,b\n"",2')).toEqual([{ a: null, b: 2 }])
	})

	it('returns no rows when the input is only a header line', () => {
		expect(parseCSV('a,b')).toEqual([])
		expect(parseCSV('a,b\n')).toEqual([])
	})

	it('returns no rows when a single quoted header field embeds a comma and newline', () => {
		// The entire input parses as one row (the header), so there is no data row.
		expect(parseCSV('"a,b\nc",d')).toEqual([])
	})

	it('fills missing trailing fields with null when a row is shorter than the header', () => {
		expect(parseCSV('a,b,c\n1,2')).toEqual([{ a: 1, b: 2, c: null }])
	})

	it('drops extra fields when a row is longer than the header', () => {
		expect(parseCSV('a,b\n1,2,3')).toEqual([{ a: 1, b: 2 }])
	})

	it('coerces floats, negative numbers, and leading-zero numbers', () => {
		expect(parseCSV('x\n3.14\n-5\n007')).toEqual([{ x: 3.14 }, { x: -5 }, { x: 7 }])
	})

	it('parses a single-column, single-row CSV', () => {
		expect(parseCSV('onlyheader\nval1')).toEqual([{ onlyheader: 'val1' }])
	})

	it('returns no rows for a single line with no newline (treated as header only)', () => {
		expect(parseCSV('justoneline')).toEqual([])
	})
})

// ─── tryParse ───────────────────────────────────────────────────────────

describe('tryParse', () => {
	it('rejects empty or whitespace-only input', () => {
		expect(tryParse('')).toEqual({ ok: false, error: 'Empty input.' })
		expect(tryParse('   ')).toEqual({ ok: false, error: 'Empty input.' })
	})

	it('parses valid JSON objects and arrays', () => {
		expect(tryParse('{"a":1}')).toEqual({ ok: true, value: { a: 1 }, format: 'json' })
		expect(tryParse('[1,2,3]')).toEqual({ ok: true, value: [1, 2, 3], format: 'json' })
	})

	it('reports an error for malformed JSON that starts with { or [', () => {
		const result = tryParse('{a:1}')
		expect(result.ok).toBe(false)
		expect((result as { ok: false; error: string }).error).toMatch(/^Invalid JSON: /)
	})

	it('parses CSV-shaped text (comma + newline) that does not start with { or [', () => {
		expect(tryParse('a,b\n1,2')).toEqual({ ok: true, value: [{ a: 1, b: 2 }], format: 'csv' })
	})

	it('reports an error when CSV-shaped text parses to zero data rows', () => {
		expect(tryParse('"a,b\nc",d')).toEqual({ ok: false, error: 'CSV parsed to no rows.' })
	})

	it('reports "could not detect" when text lacks both a comma and a newline, or only has one', () => {
		expect(tryParse('hello world')).toEqual({ ok: false, error: 'Could not detect JSON or CSV.' })
		expect(tryParse('a,b,c')).toEqual({ ok: false, error: 'Could not detect JSON or CSV.' })
		expect(tryParse('line1\nline2')).toEqual({ ok: false, error: 'Could not detect JSON or CSV.' })
	})
})

// ─── inferShapeAuto / inferShape (auto path) ─────────────────────────────

describe('inferShapeAuto', () => {
	it('returns an empty list for an empty array', () => {
		expect(inferShapeAuto([])).toEqual({ kind: 'list', items: [] })
	})

	it('returns a table for an array of records with no clean categorical+numeric pair', () => {
		expect(inferShapeAuto([{ a: 1 }, { a: 2 }])).toEqual({
			kind: 'table',
			columns: [{ name: 'a', type: 'number', density: 1, min: 1, max: 2 }],
			rows: [{ a: 1 }, { a: 2 }]
		})
	})

	it('returns a chart for a small array of records with a categorical+numeric pair', () => {
		const rows = [
			{ cat: 'x', val: 1 },
			{ cat: 'y', val: 2 }
		]
		expect(inferShapeAuto(rows)).toEqual({
			kind: 'chart',
			columns: [
				{ name: 'cat', type: 'string', density: 1 },
				{ name: 'val', type: 'number', density: 1, min: 1, max: 2 }
			],
			rows,
			x: 'cat',
			y: 'val'
		})
	})

	it('returns a list for an array of primitives', () => {
		expect(inferShapeAuto([1, 2, 3])).toEqual({ kind: 'list', items: [1, 2, 3] })
	})

	it('returns a record for a single plain object', () => {
		expect(inferShapeAuto({ a: 1, b: 'x', c: true })).toEqual({
			kind: 'record',
			fields: [
				{ name: 'a', type: 'number', density: 1 },
				{ name: 'b', type: 'string', density: 1 },
				{ name: 'c', type: 'boolean', density: 1 }
			],
			record: { a: 1, b: 'x', c: true }
		})
	})

	it('returns json for scalars and null', () => {
		expect(inferShapeAuto(null)).toEqual({ kind: 'json', value: null })
		expect(inferShapeAuto(42)).toEqual({ kind: 'json', value: 42 })
		expect(inferShapeAuto('hello')).toEqual({ kind: 'json', value: 'hello' })
	})

	it('falls back to table when a chart-eligible dataset exceeds the row threshold', () => {
		const manyRows = Array.from({ length: 61 }, (_, i) => ({ cat: `c${i}`, val: i }))
		const result = inferShapeAuto(manyRows)
		expect(result.kind).toBe('table')
	})

	it('falls back to table when a chart-eligible dataset exceeds the column threshold', () => {
		const manyCols = [
			{ a: 'x', b: 1, c: 2, d: 3, e: 4 },
			{ a: 'y', b: 5, c: 6, d: 7, e: 8 }
		]
		const result = inferShapeAuto(manyCols)
		expect(result.kind).toBe('table')
	})
})

// ─── inferShape (force hints) ─────────────────────────────────────────────

describe('inferShape with force hint', () => {
	it('honors force=table for an array of records', () => {
		const rows = [{ a: 1 }, { a: 2 }]
		const result = inferShape(rows, 'table')
		expect(result.kind).toBe('table')
	})

	it('honors force=chart when axes can be picked', () => {
		const rows = [
			{ cat: 'x', val: 1 },
			{ cat: 'y', val: 2 }
		]
		const result = inferShape(rows, 'chart')
		expect(result).toEqual({
			kind: 'chart',
			columns: [
				{ name: 'cat', type: 'string', density: 1 },
				{ name: 'val', type: 'number', density: 1, min: 1, max: 2 }
			],
			rows,
			x: 'cat',
			y: 'val'
		})
	})

	it('falls back from force=chart to table when no categorical+numeric pair exists', () => {
		const result = inferShape([{ a: 1 }, { a: 2 }], 'chart')
		expect(result.kind).toBe('table')
	})

	it('honors force=list for any array', () => {
		expect(inferShape([1, 2, 3], 'list')).toEqual({ kind: 'list', items: [1, 2, 3] })
	})

	it('honors force=record for a plain object', () => {
		expect(inferShape({ a: 1 }, 'record')).toEqual({
			kind: 'record',
			fields: [{ name: 'a', type: 'number', density: 1 }],
			record: { a: 1 }
		})
	})

	it('falls back to auto inference when the forced shape does not fit the value', () => {
		// force=table requires an array of plain objects; a plain object doesn't qualify.
		expect(inferShape({ a: 1 }, 'table')).toEqual({
			kind: 'record',
			fields: [{ name: 'a', type: 'number', density: 1 }],
			record: { a: 1 }
		})
		// force=record requires a plain object; an array doesn't qualify.
		expect(inferShape([1, 2, 3], 'record')).toEqual({ kind: 'list', items: [1, 2, 3] })
	})
})

// ─── schemaFromRecord ─────────────────────────────────────────────────────

describe('schemaFromRecord', () => {
	it('maps each field to a JSON-Schema-ish type based on detectType', () => {
		expect(
			schemaFromRecord({
				n: 1,
				s: 'x',
				b: true,
				d: '2024-01-15',
				u: null
			})
		).toEqual({
			type: 'object',
			properties: {
				n: { type: 'number' },
				s: { type: 'string' },
				b: { type: 'boolean' },
				d: { type: 'string', format: 'date' },
				u: { type: 'string' }
			}
		})
	})

	it('returns an empty properties object for an empty record', () => {
		expect(schemaFromRecord({})).toEqual({ type: 'object', properties: {} })
	})
})
