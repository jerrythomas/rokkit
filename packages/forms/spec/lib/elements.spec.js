import { describe, it, expect, vi } from 'vitest'
import { buildElements, resolveInputType } from '../../src/lib/elements.js'
import { getPath } from '../../src/lib/values.js'

const schema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		level: { type: 'number', min: 1, max: 5 },
		count: { type: 'integer' },
		tier: { type: 'string', enum: ['a', 'b'] },
		ok: { type: 'boolean' },
		tags: { type: 'array' },
		note: { type: 'string', readonly: true },
		addr: { type: 'object', properties: { city: { type: 'string' } } }
	}
}
const ctx = (data = {}, over = {}) => ({
	schema,
	layout: { type: 'vertical', elements: [] },
	data,
	value: (p) => getPath(data, p),
	message: () => null,
	dirty: () => false,
	applyLookup: () => {},
	...over
})
const build = (elements, data, over) => buildElements(elements, ctx(data, over))

describe('resolveInputType', () => {
	it('prefers a renderer, then a non-basic format, then the schema type', () => {
		expect(resolveInputType({ renderer: 'stars', type: 'number' })).toBe('stars')
		expect(resolveInputType({ format: 'email', type: 'string' })).toBe('email')
		expect(resolveInputType({ format: 'text', type: 'boolean' })).toBe('checkbox')
		expect(resolveInputType({ type: 'number', min: 0, max: 9 })).toBe('range')
		expect(resolveInputType({ type: 'integer' })).toBe('number')
		expect(resolveInputType({ type: 'array' })).toBe('array')
		expect(resolveInputType({ type: 'mystery' })).toBe('text')
		expect(resolveInputType({ type: 'string' })).toBe('text')
	})

	it('a string with an enum is a select, and the enum becomes its options', () => {
		const props = { type: 'string', enum: ['a', 'b'] }
		expect(resolveInputType(props)).toBe('select')
		expect(props.options).toEqual(['a', 'b'])
	})
})

describe('buildElements', () => {
	it('builds scoped fields with value, type and props', () => {
		const [name, level] = build([{ scope: '#/name', label: 'Name' }, { scope: '#/level' }], { name: 'Ada', level: 3 })
		expect(name).toMatchObject({ scope: '#/name', type: 'text', value: 'Ada', override: false })
		expect(name.props).toMatchObject({ label: 'Name', type: 'text', message: null, dirty: false })
		expect(level.type).toBe('range')
	})

	it('a display element keeps its own type; an unscoped one is a separator', () => {
		const [display, sep, spacer] = build(
			[{ type: 'display-card', scope: '#/name', title: 'T' }, {}, { type: 'spacer', size: 2 }],
			{ name: 'Ada' }
		)
		expect(display).toEqual({ type: 'display-card', scope: '#/name', value: 'Ada', override: false, props: { title: 'T' } })
		expect(sep.type).toBe('separator')
		expect(spacer).toMatchObject({ type: 'spacer', scope: null, props: { size: 2 } })
	})

	it('drops a field whose showWhen is false', () => {
		const els = build([{ scope: '#/name', showWhen: { field: 'ok', equals: true } }, { scope: '#/count' }], { ok: false })
		expect(els.map((e) => e.scope)).toEqual(['#/count'])
	})

	it('a readonly field is an info element; a group nests its children', () => {
		const [note, addr] = build(
			[{ scope: '#/note' }, { scope: '#/addr', elements: [{ scope: '#/addr/city', label: 'City' }] }],
			{ addr: { city: 'Pune' } }
		)
		expect(note.type).toBe('info')
		expect(addr.type).toBe('group')
		expect(addr.props.elements[0]).toMatchObject({ scope: '#/addr/city', value: 'Pune' })
	})

	it('carries messages, dirtiness and lookup state; override may come from the layout', () => {
		const applyLookup = vi.fn((path, props) => {
			props.options = ['x']
		})
		const [tier] = build([{ scope: '#/tier', override: true }], {}, {
			message: () => ({ state: 'error', text: 'bad' }),
			dirty: () => true,
			applyLookup
		})
		expect(tier.override).toBe(true)
		expect(tier.props).toMatchObject({ message: { state: 'error' }, dirty: true, options: ['x'] })
		expect(tier.props.override).toBeUndefined()
		expect(applyLookup).toHaveBeenCalledWith('tier', expect.any(Object))
	})

	it('falls back to plain text elements for the whole layout when building fails', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const layout = { type: 'vertical', elements: [{ scope: '#/name', label: 'N' }, { type: 'separator' }] }
		const els = buildElements([{ scope: '#/name' }], ctx({ name: 'Ada' }, {
			layout,
			applyLookup: () => {
				throw new Error('boom')
			}
		}))
		expect(els).toEqual([
			{ scope: '#/name', type: 'text', value: 'Ada', override: false, props: { label: 'N', message: null, dirty: false, type: 'text' } }
		])
		expect(warn).toHaveBeenCalled()
		warn.mockRestore()
	})
})
