import { describe, it, expect } from 'vitest'
import { ProxyItem, buildProxyList, buildFlatView } from './proxy.svelte.js'

// ─── ProxyItem: field access via get() ─────────────────────────────────────
//
// get(fieldName) maps a semantic name to the raw key via fields config
// and returns the raw value. It is purely a field mapper — no computed
// logic, no control state (expanded/selected). Returns undefined for
// primitive items (they have no named fields).

describe('ProxyItem — get()', () => {
	it('get("text") returns raw label field', () => {
		const p = new ProxyItem({ label: 'Hello' })
		expect(p.get('text')).toBe('Hello')
	})

	it('get() respects custom field mapping', () => {
		const p = new ProxyItem({ name: 'Foo', img: 'star.svg' }, { text: 'name', icon: 'img' })
		expect(p.get('text')).toBe('Foo')
		expect(p.get('icon')).toBe('star.svg')
	})

	it('get() falls back to raw key when fieldName not in mapping', () => {
		const p = new ProxyItem({ color: 'blue', size: 'lg' })
		expect(p.get('color')).toBe('blue')
		expect(p.get('size')).toBe('lg')
	})

	it('get("value") returns raw value field', () => {
		const p = new ProxyItem({ label: 'A', value: 99 })
		expect(p.get('value')).toBe(99)
	})

	it('get("icon") returns raw icon field', () => {
		const p = new ProxyItem({ label: 'A', icon: 'star' })
		expect(p.get('icon')).toBe('star')
	})

	it('get("href") returns raw href field', () => {
		const p = new ProxyItem({ label: 'A', href: '/a' })
		expect(p.get('href')).toBe('/a')
	})

	it('get("disabled") returns raw disabled field', () => {
		expect(new ProxyItem({ label: 'A', disabled: true }).get('disabled')).toBe(true)
		expect(new ProxyItem({ label: 'A', disabled: false }).get('disabled')).toBe(false)
		expect(new ProxyItem({ label: 'A' }).get('disabled')).toBeUndefined()
	})

	it('get("text") and get("value") return the primitive after normalisation', () => {
		expect(new ProxyItem('hello').get('text')).toBe('hello')
		expect(new ProxyItem('hello').get('value')).toBe('hello')
		expect(new ProxyItem(42).get('text')).toBe(42)
		expect(new ProxyItem(42).get('value')).toBe(42)
	})

	it('get() returns undefined for non-mapped fields on a primitive', () => {
		expect(new ProxyItem('hello').get('icon')).toBeUndefined()
		expect(new ProxyItem('hello').get('color')).toBeUndefined()
	})
})

// ─── ProxyItem: field-mapped property accessors ────────────────────────────
//
// These differ from get() in that they apply computed logic:
//   text  — never undefined; returns '' for objects, String(raw) for primitives
//   value — falls back to the raw item itself when no value field present

describe('ProxyItem — field accessors', () => {
	it('text reads label field by default', () => {
		expect(new ProxyItem({ label: 'Hello' }).text).toBe('Hello')
	})

	it('text falls back to empty string when label field is absent', () => {
		expect(new ProxyItem({ type: 'separator' }).text).toBe('')
	})

	it('value returns value field when present', () => {
		expect(new ProxyItem({ label: 'A', value: 42 }).value).toBe(42)
	})

	it('value falls back to the raw item when value field is absent', () => {
		const raw = { label: 'A' }
		expect(new ProxyItem(raw).value).toBe(raw)
	})

	it('icon returns undefined when not set', () => {
		expect(new ProxyItem({ label: 'A' }).icon).toBeUndefined()
	})

	it('href returns the href field', () => {
		expect(new ProxyItem({ label: 'A', href: '/a' }).href).toBe('/a')
	})

	it('snippet returns the snippet field', () => {
		expect(new ProxyItem({ label: 'A', snippet: 'card' }).snippet).toBe('card')
	})

	it('snippet returns undefined when not set', () => {
		expect(new ProxyItem({ label: 'A' }).snippet).toBeUndefined()
	})

	it('children returns empty array when children field is absent', () => {
		expect(new ProxyItem({ label: 'A' }).children).toHaveLength(0)
	})

	it('children returns ProxyItem instances (not raw objects)', () => {
		const p = new ProxyItem({ label: 'G', children: [{ label: 'C1' }, { label: 'C2' }] })
		expect(p.children).toHaveLength(2)
		expect(p.children[0]).toBeInstanceOf(ProxyItem)
		expect(p.children[0].text).toBe('C1')
		expect(p.children[1].text).toBe('C2')
	})

	it('children ProxyItems are stable (same instances on repeated access)', () => {
		const p = new ProxyItem({ label: 'G', children: [{ label: 'C' }] })
		expect(p.children[0]).toBe(p.children[0])
	})
})

// ─── ProxyItem: structural props (key + level) ────────────────────────────

// ─── ProxyItem: structural props (key + level) ────────────────────────────
//
// Invariant: level === key.split('-').length
//   root items built by buildProxyList: key '0' → level 1
//   first-level children:              key '0-0' → level 2
//   second-level children:             key '0-0-0' → level 3
//
// When constructed directly without arguments, key = '' and level = 0
// (standalone use, not part of a buildProxyList tree).

describe('ProxyItem — key and level', () => {
	it('key defaults to empty string when not provided', () => {
		expect(new ProxyItem({ label: 'A' }).key).toBe('')
	})

	it('level defaults to 0 when not provided', () => {
		expect(new ProxyItem({ label: 'A' }).level).toBe(0)
	})

	it('key is set from constructor argument', () => {
		expect(new ProxyItem({ label: 'A' }, {}, '1').key).toBe('1')
	})

	it('level is set from constructor argument', () => {
		expect(new ProxyItem({ label: 'A' }, {}, '1', 2).level).toBe(2)
	})

	it('children inherit key as parent-key-index', () => {
		const p = new ProxyItem({ label: 'G', children: [{ label: 'C1' }, { label: 'C2' }] }, {}, '0', 1)
		expect(p.children[0].key).toBe('0-0')
		expect(p.children[1].key).toBe('0-1')
	})

	it('children level = key.split("-").length', () => {
		const p = new ProxyItem({ label: 'G', children: [{ label: 'C' }] }, {}, '0', 1)
		const child = p.children[0]
		expect(child.key).toBe('0-0')
		expect(child.level).toBe(child.key.split('-').length) // 2
	})

	it('deep nesting: level === key.split("-").length at every depth', () => {
		const p = new ProxyItem(
			{ label: 'A', children: [{ label: 'B', children: [{ label: 'C' }] }] },
			{}, '0', 1
		)
		const b = p.children[0]
		const c = b.children[0]
		expect(b.key).toBe('0-0')
		expect(b.level).toBe(2) // '0-0'.split('-').length = 2
		expect(c.key).toBe('0-0-0')
		expect(c.level).toBe(3) // '0-0-0'.split('-').length = 3
	})
})

// ─── ProxyItem: primitive items ────────────────────────────────────────────
//
// Primitive items (string, number) are valid. The proxy treats the primitive
// itself as the text and value; all other fields return safe defaults.

describe('ProxyItem — primitive items', () => {
	it('text returns the string value for a string item', () => {
		expect(new ProxyItem('hello').text).toBe('hello')
	})

	it('text returns the number value for a number item (no coercion)', () => {
		expect(new ProxyItem(42).text).toBe(42)
	})

	it('value returns the primitive itself', () => {
		expect(new ProxyItem('hello').value).toBe('hello')
		expect(new ProxyItem(42).value).toBe(42)
	})

	it('icon returns undefined', () => {
		expect(new ProxyItem('hello').icon).toBeUndefined()
	})

	it('href returns undefined', () => {
		expect(new ProxyItem('hello').href).toBeUndefined()
	})

	it('disabled is always false', () => {
		expect(new ProxyItem('hello').disabled).toBe(false)
	})

	it('hasChildren is always false', () => {
		expect(new ProxyItem('hello').hasChildren).toBe(false)
	})

	it('children is always []', () => {
		expect(new ProxyItem('hello').children).toEqual([])
	})

	it('type is always "item"', () => {
		expect(new ProxyItem('hello').type).toBe('item')
	})

	it('expanded and selected work via internal state (no write-back for primitives)', () => {
		const p = new ProxyItem('hello')
		expect(p.expanded).toBe(false)
		expect(p.selected).toBe(false)
		p.expanded = true
		p.selected = true
		expect(p.expanded).toBe(true)
		expect(p.selected).toBe(true)
	})

	it('value falls back to the original primitive (not the normalised wrapper)', () => {
		// proxy.value should return the raw primitive, not the internal { label, value } object
		const p = new ProxyItem('hello')
		// #item['value'] = 'hello' — so value field IS set, returns 'hello' directly
		expect(p.value).toBe('hello')
	})
})

// ─── ProxyItem: type detection ─────────────────────────────────────────────

describe('ProxyItem — type', () => {
	it('item without children → "item"', () => {
		expect(new ProxyItem({ label: 'A' }).type).toBe('item')
	})

	it('item with children → "group"', () => {
		expect(new ProxyItem({ label: 'G', children: [{ label: 'C' }] }).type).toBe('group')
	})

	it('empty children array → "item" (not group)', () => {
		expect(new ProxyItem({ label: 'A', children: [] }).type).toBe('item')
	})

	it('explicit separator type', () => {
		expect(new ProxyItem({ type: 'separator' }).type).toBe('separator')
	})

	it('explicit spacer type', () => {
		expect(new ProxyItem({ type: 'spacer' }).type).toBe('spacer')
	})
})

// ─── ProxyItem: disabled ───────────────────────────────────────────────────

describe('ProxyItem — disabled', () => {
	it('false when field absent', () => {
		expect(new ProxyItem({ label: 'A' }).disabled).toBe(false)
	})

	it('true when disabled field is true', () => {
		expect(new ProxyItem({ label: 'A', disabled: true }).disabled).toBe(true)
	})

	it('false when disabled field is false', () => {
		expect(new ProxyItem({ label: 'A', disabled: false }).disabled).toBe(false)
	})

	it('read-only from item — Wrapper never writes disabled', () => {
		const p = new ProxyItem({ label: 'A', disabled: true })
		// disabled has no setter — data-driven only
		expect(() => (p.disabled = false)).toThrow()
	})
})

// ─── ProxyItem: expanded — two modes ──────────────────────────────────────

describe('ProxyItem — expanded (two modes)', () => {
	describe('internal mode (item has no expanded field)', () => {
		it('defaults to false', () => {
			const p = new ProxyItem({ label: 'G', children: [{ label: 'C' }] })
			expect(p.expanded).toBe(false)
		})

		it('set expanded stores in internal state', () => {
			const p = new ProxyItem({ label: 'G', children: [{ label: 'C' }] })
			p.expanded = true
			expect(p.expanded).toBe(true)
		})

		it('raw item is NOT mutated', () => {
			const raw = { label: 'G', children: [{ label: 'C' }] }
			const p = new ProxyItem(raw)
			p.expanded = true
			expect('expanded' in raw).toBe(false)
		})
	})

	describe('external mode (item has expanded field)', () => {
		it('reads initial value from item', () => {
			const p = new ProxyItem({ label: 'G', expanded: true, children: [{ label: 'C' }] })
			expect(p.expanded).toBe(true)
		})

		it('set expanded writes back to raw item', () => {
			const raw = { label: 'G', expanded: false, children: [{ label: 'C' }] }
			const p = new ProxyItem(raw)
			p.expanded = true
			expect(raw.expanded).toBe(true)
			expect(p.expanded).toBe(true)
		})
	})
})

// ─── ProxyItem: selected — two modes ──────────────────────────────────────

describe('ProxyItem — selected (two modes)', () => {
	it('defaults to false (internal mode)', () => {
		expect(new ProxyItem({ label: 'A' }).selected).toBe(false)
	})

	it('reads initial value from item (external mode)', () => {
		expect(new ProxyItem({ label: 'A', selected: true }).selected).toBe(true)
	})

	it('set selected stores in internal state (internal mode)', () => {
		const p = new ProxyItem({ label: 'A' })
		p.selected = true
		expect(p.selected).toBe(true)
	})

	it('set selected writes back to raw item (external mode)', () => {
		const raw = { label: 'A', selected: false }
		const p = new ProxyItem(raw)
		p.selected = true
		expect(raw.selected).toBe(true)
	})
})

// ─── buildProxyList ─────────────────────────────────────────────────────────

describe('buildProxyList', () => {
	it('handles undefined items gracefully (returns empty lookup and roots)', () => {
		const { lookup, roots } = buildProxyList(undefined)
		expect(lookup.size).toBe(0)
		expect(roots).toHaveLength(0)
	})

	it('handles null items gracefully', () => {
		const { lookup, roots } = buildProxyList(null)
		expect(lookup.size).toBe(0)
		expect(roots).toHaveLength(0)
	})

	it('handles empty array', () => {
		const { lookup, roots } = buildProxyList([])
		expect(lookup.size).toBe(0)
		expect(roots).toHaveLength(0)
	})

	it('returns lookup and roots for flat list', () => {
		const { lookup, roots } = buildProxyList([{ label: 'A' }, { label: 'B' }])
		expect(lookup.size).toBe(2)
		expect(roots).toHaveLength(2)
		expect(roots[0].key).toBe('0')
		expect(roots[1].key).toBe('1')
	})

	it('proxies in roots match lookup', () => {
		const { lookup, roots } = buildProxyList([{ label: 'A' }])
		expect(roots[0].proxy).toBe(lookup.get('0'))
	})

	it('assigns nested keys', () => {
		const { lookup } = buildProxyList([
			{ label: 'G', children: [{ label: 'C1' }, { label: 'C2' }] }
		])
		expect(lookup.has('0')).toBe(true)
		expect(lookup.has('0-0')).toBe(true)
		expect(lookup.has('0-1')).toBe(true)
	})

	it('builds children array in tree', () => {
		const { roots } = buildProxyList([
			{ label: 'G', children: [{ label: 'C' }] }
		])
		expect(roots[0].children).toHaveLength(1)
		expect(roots[0].children[0].key).toBe('0-0')
	})

	it('handles deep nesting', () => {
		const { lookup } = buildProxyList([
			{ label: 'A', children: [{ label: 'B', children: [{ label: 'C' }] }] }
		])
		expect(lookup.has('0')).toBe(true)
		expect(lookup.has('0-0')).toBe(true)
		expect(lookup.has('0-0-0')).toBe(true)
	})

	it('handles multiple top-level groups', () => {
		const { lookup, roots } = buildProxyList([
			{ label: 'G1', children: [{ label: 'A' }] },
			{ label: 'G2', children: [{ label: 'B' }] }
		])
		expect(roots).toHaveLength(2)
		expect(lookup.has('1-0')).toBe(true)
	})

	it('handles primitive items', () => {
		const { lookup, roots } = buildProxyList(['alpha', 'beta', 'gamma'])
		expect(lookup.size).toBe(3)
		expect(roots[0].proxy.text).toBe('alpha')
		expect(roots[1].proxy.value).toBe('beta')
		expect(roots[2].proxy.type).toBe('item')
	})
})

// ─── buildFlatView ──────────────────────────────────────────────────────────

describe('buildFlatView', () => {
	it('flat list: returns all items', () => {
		const { roots } = buildProxyList([{ label: 'A' }, { label: 'B' }, { label: 'C' }])
		expect(buildFlatView(roots)).toHaveLength(3)
	})

	it('excludes children of collapsed groups', () => {
		const { roots } = buildProxyList([
			{ label: 'G', children: [{ label: 'C' }] },
			{ label: 'A' }
		])
		const view = buildFlatView(roots)
		expect(view).toHaveLength(2)
		expect(view.map((n) => n.key)).toEqual(['0', '1'])
	})

	it('includes children of expanded groups', () => {
		const { roots } = buildProxyList([
			{ label: 'G', children: [{ label: 'C' }] },
			{ label: 'A' }
		])
		roots[0].proxy.expanded = true
		const view = buildFlatView(roots)
		expect(view).toHaveLength(3)
		expect(view.map((n) => n.key)).toEqual(['0', '0-0', '1'])
	})

	it('level === key.split("-").length for every node', () => {
		const { roots } = buildProxyList([
			{ label: 'G', children: [{ label: 'C', children: [{ label: 'D' }] }] }
		])
		roots[0].proxy.expanded = true
		roots[0].children[0].proxy.expanded = true
		const view = buildFlatView(roots)
		for (const node of view) {
			expect(node.level).toBe(node.key.split('-').length)
		}
		// G (key '0') → level 1, C (key '0-0') → level 2, D (key '0-0-0') → level 3
		expect(view[0].level).toBe(1)
		expect(view[1].level).toBe(2)
		expect(view[2].level).toBe(3)
	})

	it('separators and spacers appear in flatView', () => {
		const { roots } = buildProxyList([
			{ label: 'A' },
			{ type: 'separator' },
			{ label: 'B' }
		])
		const view = buildFlatView(roots)
		expect(view).toHaveLength(3)
		expect(view[1].type).toBe('separator')
	})

	it('sets hasChildren correctly', () => {
		const { roots } = buildProxyList([
			{ label: 'G', children: [{ label: 'C' }] },
			{ label: 'A' }
		])
		const view = buildFlatView(roots)
		expect(view[0].hasChildren).toBe(true)
		expect(view[1].hasChildren).toBe(false)
	})

	it('handles primitive items in flat view', () => {
		const { roots } = buildProxyList(['alpha', 'beta'])
		const view = buildFlatView(roots)
		expect(view).toHaveLength(2)
		expect(view[0].proxy.text).toBe('alpha')
		expect(view[1].proxy.type).toBe('item')
	})
})

// ─── $derived reactivity: THE KEY TEST ────────────────────────────────────
//
// Proves that a $derived reading proxy.expanded through buildFlatView
// correctly re-computes when proxy.expanded changes.
//
// The invariant that makes this work: proxies are STABLE objects created once
// in buildProxyList. Their $state signals never change identity, so $derived
// subscriptions remain valid across re-computations.

// Wrapper-like class that uses $derived(buildFlatView(roots))
// All $derived fields live in the class — never inside test function bodies.
class ReactiveList {
	#roots
	flatView = $derived(buildFlatView(this.#roots))
	// Chain: re-derives when flatView re-derives (i.e. when any proxy.selected changes)
	selectedKeys = $derived(this.flatView.filter((n) => n.proxy.selected).map((n) => n.key))

	constructor(items, fields = {}) {
		const { roots } = buildProxyList(items, fields)
		this.#roots = roots
	}

	get roots() {
		return this.#roots
	}
}

describe('$derived reactivity', () => {
	it('flatView re-computes when proxy.expanded changes (internal mode)', () => {
		const list = new ReactiveList([
			{ label: 'Elements', children: [{ label: 'List' }, { label: 'Menu' }] },
			{ label: 'Introduction' }
		])

		// Initially collapsed: Elements + Introduction = 2
		expect(list.flatView).toHaveLength(2)
		expect(list.flatView.map((n) => n.key)).toEqual(['0', '1'])

		// Expand Elements
		list.roots[0].proxy.expanded = true

		// Now: Elements + List + Menu + Introduction = 4
		expect(list.flatView).toHaveLength(4)
		expect(list.flatView.map((n) => n.key)).toEqual(['0', '0-0', '0-1', '1'])
	})

	it('flatView re-computes when nested proxy.expanded changes', () => {
		const list = new ReactiveList([
			{
				label: 'A',
				children: [{ label: 'B', children: [{ label: 'C' }] }]
			}
		])

		// Expand A → shows A + B
		list.roots[0].proxy.expanded = true
		expect(list.flatView).toHaveLength(2)
		expect(list.flatView.map((n) => n.key)).toEqual(['0', '0-0'])

		// Expand B (key '0-0') → shows A + B + C
		list.roots[0].children[0].proxy.expanded = true
		expect(list.flatView).toHaveLength(3)
		expect(list.flatView.map((n) => n.key)).toEqual(['0', '0-0', '0-0-0'])
	})

	it('collapsing a group removes children from flatView', () => {
		const list = new ReactiveList([
			{ label: 'G', children: [{ label: 'C' }] }
		])

		list.roots[0].proxy.expanded = true
		expect(list.flatView).toHaveLength(2)

		list.roots[0].proxy.expanded = false
		expect(list.flatView).toHaveLength(1)
	})

	it('selectedKeys re-computes when proxy.selected changes', () => {
		const list = new ReactiveList([{ label: 'A' }, { label: 'B' }])

		expect(list.selectedKeys).toEqual([])

		list.roots[1].proxy.selected = true
		expect(list.selectedKeys).toEqual(['1'])

		list.roots[0].proxy.selected = true
		expect(list.selectedKeys).toEqual(['0', '1'])
	})

	it('external mode: item with expanded field also triggers re-compute', () => {
		// Items declare their own expanded field
		const raw = { label: 'G', expanded: false, children: [{ label: 'C' }] }
		const list = new ReactiveList([raw])

		expect(list.flatView).toHaveLength(1)

		// Change via proxy (writes back to raw.expanded)
		list.roots[0].proxy.expanded = true
		expect(list.flatView).toHaveLength(2)

		// raw.expanded is now true
		expect(raw.expanded).toBe(true)
	})
})
