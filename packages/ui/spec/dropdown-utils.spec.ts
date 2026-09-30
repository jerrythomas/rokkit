import { describe, it, expect } from 'vitest'
import {
	filterItems,
	groupsAsLabels,
	groupDividerKeys,
	valueKey,
	dropdownPlacement
} from '../src/utils/dropdown.js'

const fields = { textField: 'label', childrenField: 'children' }
const items = [
	{ label: 'Apple' },
	{ label: 'Fruit', children: [{ label: 'Banana' }, { label: 'Cherry' }] },
	{ label: 'Empty', children: [] },
	{ label: 'Date' }
]

describe('filterItems', () => {
	it('keeps leaves whose text contains the query, case-insensitively', () => {
		expect(filterItems(items, 'APP', fields)).toEqual([{ label: 'Apple' }])
	})
	it('keeps a group with only its matching children, and drops a group with none', () => {
		expect(filterItems(items, 'an', fields)).toEqual([{ label: 'Fruit', children: [{ label: 'Banana' }] }])
		expect(filterItems(items, 'zzz', fields)).toEqual([])
	})
	it('treats an empty children array as a leaf, and a missing label as empty text', () => {
		expect(filterItems(items, 'emp', fields)).toEqual([{ label: 'Empty', children: [] }])
		expect(filterItems([{ value: 1 }], 'x', fields)).toEqual([])
	})
	it('honours custom field names', () => {
		const custom = [{ name: 'Kiwi', kids: [{ name: 'Gold' }] }]
		expect(filterItems(custom, 'gold', { textField: 'name', childrenField: 'kids' })).toEqual([
			{ name: 'Kiwi', kids: [{ name: 'Gold' }] }
		])
	})
})

describe('groupsAsLabels', () => {
	it('forces every non-empty group expanded and disabled, leaving leaves untouched', () => {
		const out = groupsAsLabels(items, 'children')
		expect(out[0]).toBe(items[0])
		expect(out[1]).toMatchObject({ label: 'Fruit', expanded: true, disabled: true })
		expect(out[2]).toBe(items[2])
	})
})

describe('groupDividerKeys', () => {
	it('is every group key after the first', () => {
		const flat = [
			{ key: '0', hasChildren: false },
			{ key: '1', hasChildren: true },
			{ key: '1-0', hasChildren: false },
			{ key: '2', hasChildren: true },
			{ key: '3', hasChildren: true }
		]
		expect([...groupDividerKeys(flat)]).toEqual(['2', '3'])
		expect(groupDividerKeys([{ key: '0', hasChildren: false }]).size).toBe(0)
	})
})

describe('valueKey', () => {
	const flat = [
		{ key: '0', proxy: { value: 'a', disabled: false } },
		{ key: '1', proxy: { value: 'b', disabled: true } },
		{ key: '2', proxy: { value: 'b', disabled: false } }
	]
	it('is the key of the first enabled node holding the value', () => {
		expect(valueKey(flat, 'b')).toBe('2')
		expect(valueKey(flat, 'a')).toBe('0')
	})
	it('is null for an absent, null or undefined value', () => {
		expect(valueKey(flat, 'z')).toBeNull()
		expect(valueKey(flat, null)).toBeNull()
		expect(valueKey(flat, undefined)).toBeNull()
	})
})

describe('dropdownPlacement', () => {
	const trigger = { top: 100, bottom: 130, left: 40, right: 240, width: 200 }
	const viewport = { width: 1000, height: 800 }
	it('opens below the trigger, start-aligned, as wide as the trigger', () => {
		expect(dropdownPlacement(trigger, viewport, { direction: 'down', align: 'start' })).toEqual({
			position: 'fixed',
			minWidth: '200px',
			top: '134px',
			bottom: 'auto',
			left: '40px',
			right: 'auto'
		})
	})
	it('opens above for direction up, and end-aligns from the viewport edge', () => {
		expect(dropdownPlacement(trigger, viewport, { direction: 'up', align: 'end' })).toMatchObject({
			top: 'auto',
			bottom: '704px',
			left: 'auto',
			right: '760px'
		})
	})
})
