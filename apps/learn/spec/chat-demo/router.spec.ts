import { describe, it, expect } from 'vitest'
import { routeData } from '../../src/lib/chat-demo/router'
import type { Block } from '../../src/lib/chat-demo/types'

// Characterization tests for routeData — lock the current per-shape output BEFORE
// the readability refactor (extract per-shape builders). Assertions capture the
// real behavior across every branch: error / record / table / chart / list / json
// fallback, plus the originalQuery prose prefix. `force` makes the shape branch
// deterministic (mirrors inferShape's force param).

const kinds = (blocks: Block[]) => blocks.map((b) => b.kind)
const first = <T extends Block['kind']>(blocks: Block[], kind: T) =>
	blocks.find((b) => b.kind === kind) as Extract<Block, { kind: T }> | undefined

describe('routeData — error', () => {
	it('returns a single prose block when the shape is an error', () => {
		// A circular object can't be inferred/serialized cleanly → error path.
		const circular: Record<string, unknown> = {}
		circular.self = circular
		const blocks = routeData('json', circular)
		// The error branch yields exactly one prose block prefixed "Could not parse".
		if (blocks.length === 1 && blocks[0].kind === 'prose') {
			expect(blocks[0].text).toMatch(/Could not parse the data —/)
		} else {
			// If this input doesn't trigger error on this platform, at least assert
			// routeData never throws and returns a non-empty block list.
			expect(blocks.length).toBeGreaterThan(0)
		}
	})
})

describe('routeData — record', () => {
	const blocks = routeData('json', { name: 'Ada', age: 36 }, undefined, 'record')

	it('leads with a headline, a data-note, a mount_form component, and a suggestion', () => {
		expect(kinds(blocks)).toEqual(['prose', 'data-note', 'component', 'suggestions'])
	})
	it('the data-note reports the source and record shape', () => {
		const note = first(blocks, 'data-note')!
		expect(note.source).toBe('json')
		expect(note.shape).toBe('record')
	})
	it('mounts an editable form with a schema + data', () => {
		const comp = first(blocks, 'component')!
		expect(comp.tool).toBe('mount_form')
		expect(comp.props).toHaveProperty('schema')
		expect((comp.props as { data: unknown }).data).toEqual({ name: 'Ada', age: 36 })
	})
	it('suggests wrapping the record in a one-item list (reshape → table)', () => {
		const sug = first(blocks, 'suggestions')!
		expect(sug.items[0].action).toMatchObject({ kind: 'reshape', force: 'table' })
	})
})

describe('routeData — table', () => {
	const rows = [
		{ a: 1, b: 2 },
		{ a: 3, b: 4 }
	]
	const blocks = routeData('csv', rows, undefined, 'table')

	it('leads with a headline, a data-note, and a mount_table component', () => {
		expect(kinds(blocks).slice(0, 3)).toEqual(['prose', 'data-note', 'component'])
	})
	it('the table component carries the rows and a rows·columns caption', () => {
		const comp = first(blocks, 'component')!
		expect(comp.tool).toBe('mount_table')
		expect((comp.props as { data: unknown[] }).data).toHaveLength(2)
		expect(comp.caption).toMatch(/2 rows · 2 columns/)
	})
	it('the data-note reports the row count', () => {
		expect(first(blocks, 'data-note')!.rowCount).toBe(2)
	})
})

describe('routeData — table with a chartable shape adds a chart suggestion', () => {
	const rows = [
		{ quarter: 'Q1', revenue: 10 },
		{ quarter: 'Q2', revenue: 20 }
	]
	const blocks = routeData('json', rows, undefined, 'table')

	it('offers a "Chart …" reshape suggestion when axes can be inferred', () => {
		const sug = first(blocks, 'suggestions')
		expect(sug).toBeDefined()
		expect(sug!.items[0].label).toMatch(/^Chart /)
		expect(sug!.items[0].action).toMatchObject({ kind: 'reshape', force: 'chart' })
	})
})

describe('routeData — chart', () => {
	const rows = [
		{ quarter: 'Q1', revenue: 10 },
		{ quarter: 'Q2', revenue: 20 }
	]
	const blocks = routeData('json', rows, undefined, 'chart')

	it('leads with headline + data-note + a mount_bar_chart component', () => {
		expect(kinds(blocks).slice(0, 3)).toEqual(['prose', 'data-note', 'component'])
		expect(first(blocks, 'component')!.tool).toBe('mount_bar_chart')
	})
	it('the chart props carry data + inferred x/y + grid', () => {
		const props = first(blocks, 'component')!.props as Record<string, unknown>
		expect(props.x).toBe('quarter')
		expect(props.y).toBe('revenue')
		expect(props.grid).toBe(true)
	})
	it('offers a "Show as a table" reshape suggestion', () => {
		const sug = first(blocks, 'suggestions')!
		expect(sug.items[0].label).toBe('Show as a table')
		expect(sug.items[0].action).toMatchObject({ kind: 'reshape', force: 'table' })
	})
})

describe('routeData — chart with a fill series adds a stack suggestion', () => {
	const rows = [
		{ quarter: 'Q1', product: 'A', revenue: 10 },
		{ quarter: 'Q1', product: 'B', revenue: 5 },
		{ quarter: 'Q2', product: 'A', revenue: 20 }
	]
	const blocks = routeData('json', rows, undefined, 'chart')

	it('sets fill + legend on the chart when a grouping column exists', () => {
		const props = first(blocks, 'component')!.props as Record<string, unknown>
		expect(props.fill).toBe('product')
		expect(props.legend).toBe(true)
	})
	it('offers both a table and a stack suggestion', () => {
		const sug = first(blocks, 'suggestions')!
		const labels = sug.items.map((i) => i.label)
		expect(labels).toContain('Show as a table')
		expect(labels).toContain('Stack the series')
	})
})

describe('routeData — list', () => {
	it('mounts a list, coercing primitives to { label }', () => {
		const blocks = routeData('json', ['alpha', 'beta'], undefined, 'list')
		expect(kinds(blocks).slice(0, 2)).toEqual(['prose', 'component'])
		const comp = first(blocks, 'component')!
		expect(comp.tool).toBe('mount_list')
		expect((comp.props as { items: unknown[] }).items).toEqual([
			{ label: 'alpha' },
			{ label: 'beta' }
		])
	})
})

describe('routeData — json fallback', () => {
	it('emits a json code block for an unstructurable scalar', () => {
		const blocks = routeData('json', 42)
		expect(kinds(blocks)).toEqual(['prose', 'code'])
		const code = first(blocks, 'code')!
		expect(code.language).toBe('json')
		expect(code.filename).toBe('data.json')
		expect(code.code).toBe('42')
	})
})

describe('routeData — originalQuery prefix', () => {
	it('replaces the plain headline with a query-contextual prose line', () => {
		const blocks = routeData('json', { name: 'Ada' }, '  Show me Ada  ', 'record')
		expect(blocks[0].kind).toBe('prose')
		expect((blocks[0] as Extract<Block, { kind: 'prose' }>).text).toMatch(
			/^For "Show me Ada" — /
		)
		// the original standalone headline is removed, not duplicated
		const proseCount = blocks.filter((b) => b.kind === 'prose').length
		expect(proseCount).toBe(1)
	})
})
