import { describe, it, expect, beforeEach } from 'vitest'
import { ListController } from '../src/list-controller.svelte.js'

describe('ListController', () => {
	const textArray = ['Alpha', 'Beta', 'Gamma']
	const objectArray = [{ label: 'Alpha' }, { label: 'Beta' }, { label: 'Gamma' }]

	const items = $state(objectArray)

	describe('constructor', () => {
		it('should initialize with string array', () => {
			const items = $state(textArray)
			const controller = new ListController(items)
			expect(controller.isNested).toEqual(false)
			expect(controller.focused).toBeFalsy()
			expect(controller.currentKey).toBeFalsy()
			expect(controller.currentIndex).toEqual(-1)
			expect(Array.from(controller.selected)).toEqual([])
			expect(controller.expandedKeys).toBeDefined()
			expect(controller.expandedKeys.size).toBe(0)
		})

		it('should initialize with string array and value', () => {
			const items = $state(['Alpha', 'Beta', 'Gamma'])
			const controller = new ListController(items, items[1])
			const lookup = $state.snapshot(controller.lookup)
			expect(Array.from(lookup.keys())).toEqual(['0', '1', '2'])
			expect(controller.focused).toEqual(items[1])
			expect(Array.from(controller.selected)).toEqual([items[1]])
		})

		it('should initialize with object array', () => {
			const controller = new ListController(items)
			expect(controller.focused).toBeFalsy()
			expect(Array.from(controller.selected)).toEqual([])
		})

		it('should initialize with object array and value', () => {
			const controller = new ListController(items, items[1])
			expect(controller.focused).toEqual(items[1])
			expect(Array.from(controller.selected)).toEqual([items[1]])
		})
	})

	describe('moveToValue', () => {
		it('should move to node with matching value', () => {
			const proxy = new ListController(items)
			expect(proxy.focused).toBeFalsy()
			expect(proxy.moveToValue(items[0])).toBe(true)

			expect(proxy.focused).toEqual(items[0])
			expect(proxy.selected).toEqual([items[0]])
			expect(proxy.currentKey).toEqual('0')
			expect(proxy.currentIndex).toEqual(0)

			expect(proxy.moveToValue(items[0])).toBe(true)
			expect(proxy.moveToValue(items[1])).toBe(true)
			expect(proxy.focused).toEqual(items[1])

			expect(proxy.moveToValue(null)).toBe(true)
			expect(proxy.focused).toBeFalsy()
			expect(proxy.selected).toEqual([])
		})

		it('should match by extracted value field', () => {
			const opts = $state([
				{ text: 'Option A', value: 'a' },
				{ text: 'Option B', value: 'b' },
				{ text: 'Option C', value: 'c' }
			])
			const controller = new ListController(opts, 'b')
			expect(controller.focused).toEqual(opts[1])
			expect(controller.currentIndex).toEqual(1)
			expect(controller.selected).toEqual([opts[1]])

			expect(controller.moveToValue('c')).toBe(true)
			expect(controller.focused).toEqual(opts[2])

			expect(controller.moveToValue('a')).toBe(true)
			expect(controller.focused).toEqual(opts[0])
		})
	})

	describe('traversal', () => {
		let controller = null
		beforeEach(() => {
			controller = new ListController(items)
		})

		it('should not move if path is not provided', () => {
			expect(controller.moveTo()).toBe(false)
		})

		it('should to path string', () => {
			expect(controller.moveTo('1')).toBe(true)
			expect(controller.focused).toEqual(items[1])
		})

		it('should move to next sibling if available', () => {
			expect(controller.moveNext()).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.moveNext()).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.moveNext()).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.moveNext()).toBe(false)
		})

		it('should move to previous sibling if available', () => {
			expect(controller.movePrev()).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.movePrev()).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.movePrev()).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.movePrev()).toBe(false)
		})

		it('should move to first node', () => {
			expect(controller.moveFirst()).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.moveFirst()).toBe(false)
		})

		it('should move to last node', () => {
			expect(controller.moveLast()).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.moveLast()).toBe(false)
		})
	})

	describe('disabled items', () => {
		const disabledItems = $state([
			{ text: 'Alpha' },
			{ text: 'Beta', disabled: true },
			{ text: 'Gamma' },
			{ text: 'Delta', disabled: true }
		])

		it('moveNext skips disabled item', () => {
			const controller = new ListController(disabledItems)
			controller.moveFirst()
			expect(controller.focused).toEqual(disabledItems[0])
			expect(controller.moveNext()).toBe(true)
			expect(controller.focused).toEqual(disabledItems[2])
		})

		it('movePrev skips disabled item', () => {
			const controller = new ListController(disabledItems)
			controller.moveTo('2')
			expect(controller.focused).toEqual(disabledItems[2])
			expect(controller.movePrev()).toBe(true)
			expect(controller.focused).toEqual(disabledItems[0])
		})

		it('moveFirst skips disabled first item', () => {
			const allDisabledFirst = $state([
				{ text: 'A', disabled: true },
				{ text: 'B' },
				{ text: 'C' }
			])
			const controller = new ListController(allDisabledFirst)
			expect(controller.moveFirst()).toBe(true)
			expect(controller.focused).toEqual(allDisabledFirst[1])
		})

		it('moveLast skips disabled last item', () => {
			const controller = new ListController(disabledItems)
			expect(controller.moveLast()).toBe(true)
			expect(controller.focused).toEqual(disabledItems[2])
		})

		it('moveNext at last enabled item stays put', () => {
			const controller = new ListController(disabledItems)
			controller.moveTo('2')
			expect(controller.moveNext()).toBe(false)
			expect(controller.focused).toEqual(disabledItems[2])
		})

		it('movePrev at first enabled item stays put', () => {
			const allDisabledFirst = $state([
				{ text: 'A', disabled: true },
				{ text: 'B' },
				{ text: 'C' }
			])
			const controller = new ListController(allDisabledFirst)
			controller.moveTo('1')
			expect(controller.movePrev()).toBe(false)
			expect(controller.focused).toEqual(allDisabledFirst[1])
		})

		it('all disabled items — movement returns false', () => {
			const allDisabled = $state([
				{ text: 'A', disabled: true },
				{ text: 'B', disabled: true }
			])
			const controller = new ListController(allDisabled)
			expect(controller.moveFirst()).toBe(false)
			expect(controller.moveLast()).toBe(false)
			expect(controller.moveNext()).toBe(false)
			expect(controller.movePrev()).toBe(false)
		})
	})

	describe('selection', () => {
		let controller = null

		beforeEach(() => {
			controller = new ListController(items)
		})

		it('should select item by path', () => {
			expect(controller.select('1')).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.selected).toEqual([items[1]])

			expect(controller.select('2')).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.selected).toEqual([items[2]])

			expect(controller.select('5')).toBe(false)

			controller.movePrev()
			expect(controller.focused).toEqual(items[1])
			expect(controller.selected).toEqual([items[2]])

			expect(controller.select()).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.selected).toEqual([items[1]])

			expect(controller.extendSelection('0')).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.selected).toEqual([items[0]])
		})

		it('should extend selection in multiselect mode', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			expect(multi.extendSelection('1')).toBe(true)
			expect(multi.selected).toEqual([items[1]])
			expect(multi.extendSelection('0')).toBe(true)
			expect(multi.selected).toEqual([items[1], items[0]])
			expect(multi.extendSelection('1')).toBe(true)
			expect(multi.selected).toEqual([items[0]])
			expect(multi.extendSelection('0')).toBe(true)
			expect(multi.selected).toEqual([])
			expect(multi.extendSelection('0')).toBe(true)
			expect(multi.selected).toEqual([items[0]])
			expect(multi.extendSelection()).toBe(false)
			expect(multi.extendSelection('99')).toBe(false)
			expect(multi.selected).toEqual([items[0]])
		})
	})

	describe('findByText', () => {
		it('should find item by text prefix', () => {
			const controller = new ListController(items)
			expect(controller.findByText('Al')).toBe('0')
			expect(controller.findByText('Be')).toBe('1')
			expect(controller.findByText('Ga')).toBe('2')
		})

		it('should be case-insensitive', () => {
			const controller = new ListController(items)
			expect(controller.findByText('al')).toBe('0')
			expect(controller.findByText('BETA')).toBe('1')
			expect(controller.findByText('gAmMa')).toBe('2')
		})

		it('should return null when no match', () => {
			const controller = new ListController(items)
			expect(controller.findByText('Zz')).toBe(null)
		})

		it('should start search after startAfterKey', () => {
			const controller = new ListController(items)
			// Start after '0' (Alpha) — next match for 'G' is Gamma at index 2
			expect(controller.findByText('G', '0')).toBe('2')
			// Start after '2' (Gamma) — wraps around to Alpha at index 0
			expect(controller.findByText('A', '2')).toBe('0')
		})

		it('should cycle to earlier items via wrap-around', () => {
			const dupes = $state([{ label: 'Apple' }, { label: 'Avocado' }, { label: 'Banana' }])
			const controller = new ListController(dupes)
			// Start after '0' (Apple) — should find Avocado next
			expect(controller.findByText('A', '0')).toBe('1')
			// Start after '1' (Avocado) — wraps around to find Apple
			expect(controller.findByText('A', '1')).toBe('0')
		})

		it('should skip disabled items', () => {
			const disabledItems = $state([
				{ label: 'Alpha', disabled: true },
				{ label: 'Ace' },
				{ label: 'Beta' }
			])
			const controller = new ListController(disabledItems)
			expect(controller.findByText('A')).toBe('1')
		})

		it('should work with string arrays', () => {
			const strings = $state(['Apple', 'Banana', 'Cherry'])
			const controller = new ListController(strings)
			expect(controller.findByText('B')).toBe('1')
			expect(controller.findByText('C')).toBe('2')
		})
	})

	describe('range selection', () => {
		it('should select range between anchor and target', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			// Select first item to set anchor
			multi.select('0')
			expect(multi.selected).toEqual([items[0]])

			// Range select to last item
			expect(multi.selectRange('2')).toBe(true)
			expect(multi.selected).toEqual([items[0], items[1], items[2]])
		})

		it('should select range in reverse direction', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			multi.select('2')
			expect(multi.selectRange('0')).toBe(true)
			expect(multi.selected).toEqual([items[0], items[1], items[2]])
		})

		it('should skip disabled items in range', () => {
			const disabledItems = $state([
				{ text: 'A' },
				{ text: 'B', disabled: true },
				{ text: 'C' },
				{ text: 'D' }
			])
			const multi = new ListController(disabledItems, null, {}, { multiselect: true })
			multi.select('0')
			expect(multi.selectRange('3')).toBe(true)
			// B is disabled, should be skipped
			expect(multi.selected).toEqual([disabledItems[0], disabledItems[2], disabledItems[3]])
		})

		it('should move focus to target but keep anchor', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			multi.select('0')
			multi.selectRange('2')
			expect(multi.focused).toEqual(items[2])
			// Second range select from same anchor
			multi.selectRange('1')
			expect(multi.selected).toEqual([items[0], items[1]])
			expect(multi.focused).toEqual(items[1])
		})

		it('should fall back to select when not multiselect', () => {
			const single = new ListController(items)
			single.select('0')
			expect(single.selectRange('2')).toBe(true)
			// In single mode, selectRange acts as select
			expect(single.selected).toEqual([items[2]])
		})

		it('should return false for invalid key', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			multi.select('0')
			expect(multi.selectRange('99')).toBe(false)
		})

		it('should use focusedKey as anchor when no prior selection', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			multi.moveFirst()
			expect(multi.selectRange('2')).toBe(true)
			expect(multi.selected).toEqual([items[0], items[1], items[2]])
		})

		it('extendSelection sets anchor for subsequent range', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			// Toggle-select item 1 (sets anchor)
			multi.extendSelection('1')
			expect(multi.selected).toEqual([items[1]])
			// Range from anchor (1) to target (2)
			multi.selectRange('2')
			expect(multi.selected).toEqual([items[1], items[2]])
		})
	})
})
