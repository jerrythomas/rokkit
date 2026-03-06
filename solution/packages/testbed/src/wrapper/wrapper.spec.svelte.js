import { describe, it, expect, vi } from 'vitest'
import { Wrapper } from './wrapper.svelte.js'
import { ProxyTree } from '../proxy/proxy-tree.svelte.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const flat = [
	{ label: 'Alpha' },
	{ label: 'Beta' },
	{ label: 'Gamma' }
]

const nested = [
	{
		label: 'Fruits',
		children: [
			{ label: 'Apple', value: 'apple' },
			{ label: 'Banana', value: 'banana' }
		]
	},
	{ label: 'Vegetables', value: 'veg' }
]

const withDisabled = [
	{ label: 'A' },
	{ label: 'B (disabled)', disabled: true },
	{ label: 'C' }
]

const withSeparator = [
	{ label: 'A' },
	{ type: 'separator' },
	{ label: 'B' }
]

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('Wrapper — constructor', () => {
	it('creates with empty items → empty flatView', () => {
		const w = new Wrapper(new ProxyTree())
		expect(w.flatView).toHaveLength(0)
	})

	it('creates with flat items → flatView matches item count', () => {
		const w = new Wrapper(new ProxyTree(flat))
		expect(w.flatView).toHaveLength(3)
	})

	it('creates with nested items → flatView shows only roots initially (groups collapsed)', () => {
		const w = new Wrapper(new ProxyTree(nested))
		// 'Fruits' (group) + 'Vegetables' — children collapsed
		expect(w.flatView).toHaveLength(2)
	})

	it('flatView nodes have correct keys and levels', () => {
		const w = new Wrapper(new ProxyTree(flat))
		expect(w.flatView[0].key).toBe('0')
		expect(w.flatView[0].level).toBe(1)
		expect(w.flatView[1].key).toBe('1')
		expect(w.flatView[2].key).toBe('2')
	})

	it('lookup contains all items (including nested)', () => {
		const w = new Wrapper(new ProxyTree(nested))
		expect(w.lookup.has('0')).toBe(true)   // Fruits group
		expect(w.lookup.has('0-0')).toBe(true) // Apple
		expect(w.lookup.has('0-1')).toBe(true) // Banana
		expect(w.lookup.has('1')).toBe(true)   // Vegetables
	})

	it('focusedKey starts as null', () => {
		expect(new Wrapper(new ProxyTree(flat)).focusedKey).toBeNull()
	})
})

// ─── flatView reactivity ──────────────────────────────────────────────────────

describe('Wrapper — flatView reactivity', () => {
	it('expanding a group adds its children to flatView', () => {
		const w = new Wrapper(new ProxyTree(nested))
		expect(w.flatView).toHaveLength(2)

		w.lookup.get('0').expanded = true
		expect(w.flatView).toHaveLength(4) // Fruits + Apple + Banana + Vegetables
		expect(w.flatView.map((n) => n.key)).toEqual(['0', '0-0', '0-1', '1'])
	})

	it('collapsing re-hides children', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.lookup.get('0').expanded = true
		expect(w.flatView).toHaveLength(4)

		w.lookup.get('0').expanded = false
		expect(w.flatView).toHaveLength(2)
	})

	it('separators and spacers appear in flatView but do not expand', () => {
		const w = new Wrapper(new ProxyTree(withSeparator))
		expect(w.flatView).toHaveLength(3)
		expect(w.flatView[1].type).toBe('separator')
	})
})

// ─── next / prev / first / last ──────────────────────────────────────────────

describe('Wrapper — next()', () => {
	it('advances focusedKey from null → first item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		// When focusedKey is null, idx is -1, so idx+1=0 is within bounds
		w.next(null)
		expect(w.focusedKey).toBe('0')
	})

	it('advances to next item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('0')
		w.next(null)
		expect(w.focusedKey).toBe('1')
	})

	it('clamps at the last item (no wrapping)', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('2')
		w.next(null)
		expect(w.focusedKey).toBe('2')
	})

	it('skips disabled items', () => {
		const w = new Wrapper(new ProxyTree(withDisabled))
		w.moveTo('0')
		w.next(null)
		expect(w.focusedKey).toBe('2') // skips '1' (disabled)
	})

	it('skips separators', () => {
		const w = new Wrapper(new ProxyTree(withSeparator))
		w.moveTo('0')
		w.next(null)
		expect(w.focusedKey).toBe('2') // skips '1' (separator)
	})

	it('navigates into expanded group children', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.lookup.get('0').expanded = true
		w.moveTo('0')
		w.next(null)
		expect(w.focusedKey).toBe('0-0')
	})

	it('no-op on empty list', () => {
		const w = new Wrapper(new ProxyTree([]))
		w.next(null)
		expect(w.focusedKey).toBeNull()
	})
})

describe('Wrapper — prev()', () => {
	it('moves back to previous item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('2')
		w.prev(null)
		expect(w.focusedKey).toBe('1')
	})

	it('clamps at first item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('0')
		w.prev(null)
		expect(w.focusedKey).toBe('0')
	})

	it('when focusedKey is null, stays null (idx=-1, idx-1=-2 < 0)', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.prev(null)
		expect(w.focusedKey).toBeNull()
	})

	it('skips disabled items going backward', () => {
		const w = new Wrapper(new ProxyTree(withDisabled))
		w.moveTo('2')
		w.prev(null)
		expect(w.focusedKey).toBe('0') // skips '1' (disabled)
	})
})

describe('Wrapper — first() / last()', () => {
	it('first() focuses the first navigable item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('2')
		w.first(null)
		expect(w.focusedKey).toBe('0')
	})

	it('last() focuses the last navigable item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.last(null)
		expect(w.focusedKey).toBe('2')
	})

	it('first() skips leading separators', () => {
		const w = new Wrapper(new ProxyTree([{ type: 'separator' }, { label: 'A' }, { label: 'B' }]))
		w.first(null)
		expect(w.focusedKey).toBe('1')
	})

	it('last() skips trailing separators', () => {
		const w = new Wrapper(new ProxyTree([{ label: 'A' }, { label: 'B' }, { type: 'separator' }]))
		w.last(null)
		expect(w.focusedKey).toBe('1')
	})

	it('first() and last() on empty list are no-ops', () => {
		const w = new Wrapper(new ProxyTree([]))
		w.first(null)
		w.last(null)
		expect(w.focusedKey).toBeNull()
	})
})

// ─── expand / collapse ────────────────────────────────────────────────────────

describe('Wrapper — expand()', () => {
	it('expands a collapsed group', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.moveTo('0')
		w.expand(null)
		expect(w.lookup.get('0').expanded).toBe(true)
		expect(w.flatView).toHaveLength(4)
	})

	it('moves focus to first child when group is already expanded', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.lookup.get('0').expanded = true
		w.moveTo('0')
		w.expand(null)
		expect(w.focusedKey).toBe('0-0')
	})

	it('no-op on a leaf item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('0')
		w.expand(null)
		expect(w.focusedKey).toBe('0') // unchanged
	})

	it('no-op when focusedKey is null', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.expand(null)
		expect(w.lookup.get('0').expanded).toBe(false)
	})
})

describe('Wrapper — collapse()', () => {
	it('collapses an expanded group', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.lookup.get('0').expanded = true
		w.moveTo('0')
		w.collapse(null)
		expect(w.lookup.get('0').expanded).toBe(false)
		expect(w.flatView).toHaveLength(2)
	})

	it('moves focus to parent when on a child item', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.lookup.get('0').expanded = true
		w.moveTo('0-0')
		w.collapse(null)
		expect(w.focusedKey).toBe('0')
	})

	it('no-op at root level (no parent to go to)', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('0')
		w.collapse(null)
		expect(w.focusedKey).toBe('0') // unchanged
	})

	it('no-op when focusedKey is null', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.collapse(null)
		expect(w.lookup.get('0').expanded).toBe(false)
	})

	it('collapses deeply nested group', () => {
		const deep = [
			{
				label: 'A',
				children: [
					{ label: 'B', children: [{ label: 'C' }] }
				]
			}
		]
		const w = new Wrapper(new ProxyTree(deep))
		w.lookup.get('0').expanded = true
		w.lookup.get('0-0').expanded = true
		w.moveTo('0-0-0')
		w.collapse(null)
		// On leaf, goes to parent '0-0'
		expect(w.focusedKey).toBe('0-0')
	})
})

// ─── select ───────────────────────────────────────────────────────────────────

describe('Wrapper — select()', () => {
	it('fires onselect for a leaf item — value is raw item when no value field', () => {
		const onselect = vi.fn()
		const w = new Wrapper(new ProxyTree(flat), { onselect })
		w.moveTo('1')
		w.select(null)
		// proxy.value falls back to the raw item when no 'value' field is present
		expect(onselect).toHaveBeenCalledOnce()
		const [value, proxy] = onselect.mock.calls[0]
		expect(value).toEqual({ label: 'Beta' })
		expect(proxy.label).toBe('Beta')
	})

	it('fires onselect with item value when value field is present', () => {
		const onselect = vi.fn()
		const w = new Wrapper(new ProxyTree(nested), { onselect })
		w.lookup.get('0').expanded = true
		w.select('0-0') // Apple, value: 'apple'
		expect(onselect).toHaveBeenCalledOnce()
		const [value, proxy] = onselect.mock.calls[0]
		expect(value).toBe('apple')
		expect(proxy.label).toBe('Apple')
	})

	it('uses explicit path over focusedKey', () => {
		const onselect = vi.fn()
		const w = new Wrapper(new ProxyTree(flat), { onselect })
		w.moveTo('0')
		w.select('2') // explicit path overrides focused
		expect(onselect).toHaveBeenCalledOnce()
		const [, proxy] = onselect.mock.calls[0]
		expect(proxy.label).toBe('Gamma')
		expect(w.focusedKey).toBe('2')
	})

	it('falls back to focusedKey when path is null', () => {
		const onselect = vi.fn()
		const w = new Wrapper(new ProxyTree(flat), { onselect })
		w.moveTo('1')
		w.select(null)
		expect(onselect).toHaveBeenCalledOnce()
		const [, proxy] = onselect.mock.calls[0]
		expect(proxy.label).toBe('Beta')
	})

	it('toggles group expanded when selecting a group', () => {
		const onselect = vi.fn()
		const w = new Wrapper(new ProxyTree(nested), { onselect })
		w.select('0') // Fruits group
		expect(w.lookup.get('0').expanded).toBe(true)
		expect(onselect).not.toHaveBeenCalled()

		w.select('0') // toggle back
		expect(w.lookup.get('0').expanded).toBe(false)
	})

	it('no-op when key is null and focusedKey is null', () => {
		const onselect = vi.fn()
		const w = new Wrapper(new ProxyTree(flat), { onselect })
		w.select(null)
		expect(onselect).not.toHaveBeenCalled()
	})

	it('no-op for unknown key', () => {
		const onselect = vi.fn()
		const w = new Wrapper(new ProxyTree(flat), { onselect })
		w.select('99')
		expect(onselect).not.toHaveBeenCalled()
	})
})

// ─── toggle ───────────────────────────────────────────────────────────────────

describe('Wrapper — toggle()', () => {
	it('toggles group expansion', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.toggle('0')
		expect(w.lookup.get('0').expanded).toBe(true)
		w.toggle('0')
		expect(w.lookup.get('0').expanded).toBe(false)
	})

	it('falls back to focusedKey when path is null', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.moveTo('0')
		w.toggle(null)
		expect(w.lookup.get('0').expanded).toBe(true)
	})

	it('no-op for non-group item', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.toggle('0') // leaf item — no hasChildren
		// No error, no state change
		expect(w.lookup.get('0').expanded).toBe(false)
	})
})

// ─── moveTo ───────────────────────────────────────────────────────────────────

describe('Wrapper — moveTo()', () => {
	it('sets focusedKey', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('2')
		expect(w.focusedKey).toBe('2')
	})

	it('null path is ignored', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('1')
		w.moveTo(null)
		expect(w.focusedKey).toBe('1')
	})
})

// ─── findByText ───────────────────────────────────────────────────────────────

describe('Wrapper — findByText()', () => {
	it('returns key of item whose text starts with query', () => {
		const w = new Wrapper(new ProxyTree(flat))
		expect(w.findByText('a')).toBe('0') // Alpha
		expect(w.findByText('b')).toBe('1') // Beta
		expect(w.findByText('g')).toBe('2') // Gamma
	})

	it('is case-insensitive', () => {
		const w = new Wrapper(new ProxyTree(flat))
		expect(w.findByText('ALPHA')).toBe('0')
		expect(w.findByText('beta')).toBe('1')
	})

	it('returns null when no match', () => {
		const w = new Wrapper(new ProxyTree(flat))
		expect(w.findByText('z')).toBeNull()
	})

	it('startAfterKey searches from the item after the given key (for cycling)', () => {
		const items = [{ label: 'Apple' }, { label: 'Avocado' }, { label: 'Banana' }]
		const w = new Wrapper(new ProxyTree(items))
		// First 'a' → '0' (Apple); cycle: next 'a' after '0' → '1' (Avocado)
		expect(w.findByText('a', '0')).toBe('1')
		// Next 'a' after '1' → wraps to '0'
		expect(w.findByText('a', '1')).toBe('0')
	})

	it('wraps around: search from start when startAfterKey is at end', () => {
		const w = new Wrapper(new ProxyTree(flat))
		// 'g' after '2' (Gamma) → wraps, finds Gamma again at '2'
		expect(w.findByText('g', '2')).toBe('2')
	})

	it('only searches navigable items (skips disabled)', () => {
		const w = new Wrapper(new ProxyTree([
			{ label: 'Alpha' },
			{ label: 'Bravo', disabled: true },
			{ label: 'Charlie' }
		]))
		expect(w.findByText('b')).toBeNull() // 'Bravo' is disabled
	})

	it('only searches navigable items (skips separators)', () => {
		const w = new Wrapper(new ProxyTree([
			{ label: 'A' },
			{ type: 'separator' },
			{ label: 'B' }
		]))
		// Separator has no .text that starts with anything useful
		expect(w.findByText('b')).toBe('2')
	})

	it('searches children of expanded groups', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.lookup.get('0').expanded = true
		// 'Apple' is in the expanded group
		expect(w.findByText('ap')).toBe('0-0')
	})

	it('returns null on empty list', () => {
		const w = new Wrapper(new ProxyTree([]))
		expect(w.findByText('a')).toBeNull()
	})
})

// ─── cancel / blur / extend / range (no-ops for persistent list) ──────────────

describe('Wrapper — no-op methods', () => {
	it('cancel() does not change state', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('1')
		w.cancel('1')
		expect(w.focusedKey).toBe('1')
	})

	it('blur() does not change state', () => {
		const w = new Wrapper(new ProxyTree(flat))
		w.moveTo('1')
		w.blur()
		expect(w.focusedKey).toBe('1')
	})

	it('extend() does not throw', () => {
		const w = new Wrapper(new ProxyTree(flat))
		expect(() => w.extend('0')).not.toThrow()
	})

	it('range() does not throw', () => {
		const w = new Wrapper(new ProxyTree(flat))
		expect(() => w.range('0')).not.toThrow()
	})
})

// ─── Primitive items ──────────────────────────────────────────────────────────

describe('Wrapper — primitive items', () => {
	it('handles string primitive items', () => {
		const w = new Wrapper(new ProxyTree(['alpha', 'beta', 'gamma']))
		expect(w.flatView).toHaveLength(3)
		expect(w.flatView[0].proxy.label).toBe('alpha')
		expect(w.flatView[1].proxy.type).toBe('item')
	})

	it('navigation works with primitives', () => {
		const w = new Wrapper(new ProxyTree(['alpha', 'beta', 'gamma']))
		w.first(null)
		expect(w.focusedKey).toBe('0')
		w.next(null)
		expect(w.focusedKey).toBe('1')
	})

	it('findByText works with primitives', () => {
		const w = new Wrapper(new ProxyTree(['alpha', 'beta', 'gamma']))
		expect(w.findByText('b')).toBe('1')
	})
})

// ─── Custom field mapping ─────────────────────────────────────────────────────

describe('Wrapper — custom field mapping', () => {
	it('uses custom label field', () => {
		const items = [{ name: 'Alpha' }, { name: 'Beta' }]
		const w = new Wrapper(new ProxyTree(items, { label: 'name' }))
		expect(w.flatView[0].proxy.label).toBe('Alpha')
	})

	it('uses custom children field', () => {
		const items = [{ label: 'Group', items: [{ label: 'Child' }] }]
		const w = new Wrapper(new ProxyTree(items, { children: 'items' }))
		expect(w.flatView[0].hasChildren).toBe(true)
	})
})

// ─── Integration: full navigation flow ───────────────────────────────────────

describe('Wrapper — integration', () => {
	it('keyboard nav through nested list with expand/collapse', () => {
		const w = new Wrapper(new ProxyTree(nested))

		// Start at first item
		w.first(null)
		expect(w.focusedKey).toBe('0')    // Fruits (group)

		// Expand group
		w.expand(null)
		expect(w.lookup.get('0').expanded).toBe(true)

		// Move into first child
		w.next(null)
		expect(w.focusedKey).toBe('0-0')  // Apple

		// Move to next child
		w.next(null)
		expect(w.focusedKey).toBe('0-1')  // Banana

		// Collapse: moves to parent
		w.collapse(null)
		expect(w.focusedKey).toBe('0')    // back to Fruits

		// Collapse again: closes group
		w.collapse(null)
		expect(w.lookup.get('0').expanded).toBe(false)
		expect(w.focusedKey).toBe('0')    // at root, no-op

		// Move to next root item
		w.next(null)
		expect(w.focusedKey).toBe('1')    // Vegetables
	})

	it('typeahead navigates correctly after expand', () => {
		const w = new Wrapper(new ProxyTree(nested))
		w.lookup.get('0').expanded = true

		// 'f' → Fruits ('0')
		expect(w.findByText('f')).toBe('0')
		// 'a' → Apple ('0-0')
		expect(w.findByText('a')).toBe('0-0')
		// 'v' → Vegetables ('1')
		expect(w.findByText('v')).toBe('1')
	})
})
