import { describe, it, expect } from 'vitest'
import { ItemProxy, createItemProxy, defaultItemFields } from '../src/types/item-proxy.js'
import type { ItemFields } from '../src/types/item-proxy.js'

describe('ItemProxy', () => {
	// ─── Construction ───────────────────────────────────────────────

	describe('construction', () => {
		it('creates from an object', () => {
			const item = { text: 'Hello', value: 'hello' }
			const proxy = new ItemProxy(item)
			expect(proxy.text).toBe('Hello')
			expect(proxy.itemValue).toBe('hello')
		})

		it('creates from a string primitive', () => {
			const proxy = new ItemProxy('Hello')
			expect(proxy.text).toBe('Hello')
			expect(proxy.original).toBe('Hello')
		})

		it('creates from a number primitive', () => {
			const proxy = new ItemProxy(42)
			expect(proxy.text).toBe('42')
			expect(proxy.original).toBe(42)
		})

		it('normalizes string to object with text field', () => {
			const proxy = new ItemProxy('Test')
			expect(proxy.value).toEqual({ text: 'Test' })
		})

		it('normalizes number to object with text field', () => {
			const proxy = new ItemProxy(7)
			expect(proxy.value).toEqual({ text: 7 })
		})

		it('preserves the original object reference', () => {
			const item = { text: 'Original', extra: true }
			const proxy = new ItemProxy(item)
			expect(proxy.original).toBe(item)
		})

		it('applies custom field mapping', () => {
			const item = { name: 'Save', actionId: 'save' }
			const fields: ItemFields = { text: 'name', value: 'actionId' }
			const proxy = new ItemProxy(item, fields)
			expect(proxy.text).toBe('Save')
			expect(proxy.itemValue).toBe('save')
		})

		it('merges custom fields with defaults', () => {
			const fields: ItemFields = { text: 'name' }
			const proxy = new ItemProxy({ name: 'Test' }, fields)
			// Custom field applied
			expect(proxy.fields.text).toBe('name')
			// Defaults preserved
			expect(proxy.fields.value).toBe('value')
			expect(proxy.fields.icon).toBe('icon')
		})
	})

	// ─── defaultItemFields ──────────────────────────────────────────

	describe('defaultItemFields', () => {
		it('has all expected default keys', () => {
			expect(defaultItemFields).toEqual({
				text: 'text',
				value: 'value',
				icon: 'icon',
				description: 'description',
				shortcut: 'shortcut',
				label: 'label',
				disabled: 'disabled',
				active: 'active',
				type: 'type',
				children: 'children',
				snippet: 'snippet',
				href: 'href',
				badge: 'badge',
				title: 'title'
			})
		})
	})

	// ─── Text getter ────────────────────────────────────────────────

	describe('text', () => {
		it('returns the mapped text field', () => {
			const proxy = new ItemProxy({ text: 'Hello' })
			expect(proxy.text).toBe('Hello')
		})

		it('returns text from custom field mapping', () => {
			const proxy = new ItemProxy({ name: 'Custom' }, { text: 'name' })
			expect(proxy.text).toBe('Custom')
		})

		it('falls back to label field', () => {
			const proxy = new ItemProxy({ label: 'Label Text' })
			expect(proxy.text).toBe('Label Text')
		})

		it('falls back to name field', () => {
			const proxy = new ItemProxy({ name: 'Name Text' })
			expect(proxy.text).toBe('Name Text')
		})

		it('falls back to title field', () => {
			const proxy = new ItemProxy({ title: 'Title Text' })
			expect(proxy.text).toBe('Title Text')
		})

		it('respects fallback priority: label > name > title', () => {
			const proxy = new ItemProxy({ name: 'Name', title: 'Title', label: 'Label' })
			expect(proxy.text).toBe('Label')
		})

		it('stringifies the original for primitives with no text', () => {
			const proxy = new ItemProxy(99)
			expect(proxy.text).toBe('99')
		})

		it('returns empty string for object with no text-like fields', () => {
			const proxy = new ItemProxy({ foo: 'bar' })
			expect(proxy.text).toBe('')
		})

		it('converts non-string values to string', () => {
			const proxy = new ItemProxy({ text: 123 })
			expect(proxy.text).toBe('123')
		})
	})

	// ─── itemValue getter ───────────────────────────────────────────

	describe('itemValue', () => {
		it('returns the mapped value field', () => {
			const proxy = new ItemProxy({ text: 'A', value: 'val-a' })
			expect(proxy.itemValue).toBe('val-a')
		})

		it('returns value from custom field mapping', () => {
			const proxy = new ItemProxy({ actionId: 'save' }, { value: 'actionId' })
			expect(proxy.itemValue).toBe('save')
		})

		it('falls back to id field', () => {
			const proxy = new ItemProxy({ text: 'Item', id: 'item-1' })
			expect(proxy.itemValue).toBe('item-1')
		})

		it('falls back to key field', () => {
			const proxy = new ItemProxy({ text: 'Item', key: 'item-key' })
			expect(proxy.itemValue).toBe('item-key')
		})

		it('respects fallback priority: id > key > value', () => {
			const proxy = new ItemProxy({ id: 'by-id', key: 'by-key' })
			expect(proxy.itemValue).toBe('by-id')
		})

		it('falls back to original value when no value fields exist', () => {
			const item = { text: 'Only text' }
			const proxy = new ItemProxy(item)
			expect(proxy.itemValue).toBe(item)
		})

		it('returns original for string primitives', () => {
			const proxy = new ItemProxy('hello')
			// String primitives normalize to { text: 'hello' }, so 'value' fallback chain applies
			// No id/key/value fields, so returns original
			expect(proxy.itemValue).toBe('hello')
		})
	})

	// ─── icon getter ────────────────────────────────────────────────

	describe('icon', () => {
		it('returns the icon string', () => {
			const proxy = new ItemProxy({ text: 'A', icon: 'mdi:home' })
			expect(proxy.icon).toBe('mdi:home')
		})

		it('returns null when no icon', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.icon).toBeNull()
		})

		it('returns null for empty string icon', () => {
			const proxy = new ItemProxy({ text: 'A', icon: '' })
			expect(proxy.icon).toBeNull()
		})

		it('returns icon from custom field mapping', () => {
			const proxy = new ItemProxy({ glyph: 'mdi:star' }, { icon: 'glyph' })
			expect(proxy.icon).toBe('mdi:star')
		})
	})

	// ─── description getter ─────────────────────────────────────────

	describe('description', () => {
		it('returns the description field', () => {
			const proxy = new ItemProxy({ text: 'A', description: 'Some desc' })
			expect(proxy.description).toBe('Some desc')
		})

		it('returns null when no description', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.description).toBeNull()
		})

		it('falls back to hint field', () => {
			const proxy = new ItemProxy({ text: 'A', hint: 'A hint' })
			expect(proxy.description).toBe('A hint')
		})

		it('falls back to subtitle field', () => {
			const proxy = new ItemProxy({ text: 'A', subtitle: 'Sub' })
			expect(proxy.description).toBe('Sub')
		})

		it('falls back to summary field', () => {
			const proxy = new ItemProxy({ text: 'A', summary: 'Sum' })
			expect(proxy.description).toBe('Sum')
		})

		it('returns description from custom field mapping', () => {
			const proxy = new ItemProxy({ info: 'Info text' }, { description: 'info' })
			expect(proxy.description).toBe('Info text')
		})
	})

	// ─── shortcut getter ────────────────────────────────────────────

	describe('shortcut', () => {
		it('returns the shortcut field', () => {
			const proxy = new ItemProxy({ text: 'Save', shortcut: 'Ctrl+S' })
			expect(proxy.shortcut).toBe('Ctrl+S')
		})

		it('returns null when no shortcut', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.shortcut).toBeNull()
		})

		it('returns null for empty string shortcut', () => {
			const proxy = new ItemProxy({ text: 'A', shortcut: '' })
			expect(proxy.shortcut).toBeNull()
		})

		it('falls back to kbd field', () => {
			const proxy = new ItemProxy({ text: 'A', kbd: 'Ctrl+Z' })
			expect(proxy.shortcut).toBe('Ctrl+Z')
		})

		it('falls back to hotkey field', () => {
			const proxy = new ItemProxy({ text: 'A', hotkey: 'F5' })
			expect(proxy.shortcut).toBe('F5')
		})

		it('falls back to accelerator field', () => {
			const proxy = new ItemProxy({ text: 'A', accelerator: 'Alt+F4' })
			expect(proxy.shortcut).toBe('Alt+F4')
		})

		it('falls back to keyBinding field', () => {
			const proxy = new ItemProxy({ text: 'A', keyBinding: 'Ctrl+P' })
			expect(proxy.shortcut).toBe('Ctrl+P')
		})

		it('returns shortcut from custom field mapping', () => {
			const proxy = new ItemProxy({ combo: 'Ctrl+N' }, { shortcut: 'combo' })
			expect(proxy.shortcut).toBe('Ctrl+N')
		})
	})

	// ─── label getter ───────────────────────────────────────────────

	describe('label', () => {
		it('returns the label field', () => {
			const proxy = new ItemProxy({ text: 'Save', label: 'Save file' })
			expect(proxy.label).toBe('Save file')
		})

		it('falls back to text when no label', () => {
			const proxy = new ItemProxy({ text: 'Save' })
			expect(proxy.label).toBe('Save')
		})
	})

	// ─── disabled getter ────────────────────────────────────────────

	describe('disabled', () => {
		it('returns true when disabled is true', () => {
			const proxy = new ItemProxy({ text: 'A', disabled: true })
			expect(proxy.disabled).toBe(true)
		})

		it('returns false when disabled is false', () => {
			const proxy = new ItemProxy({ text: 'A', disabled: false })
			expect(proxy.disabled).toBe(false)
		})

		it('returns false when disabled is absent', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.disabled).toBe(false)
		})

		it('returns false for non-boolean disabled values', () => {
			const proxy = new ItemProxy({ text: 'A', disabled: 'yes' })
			expect(proxy.disabled).toBe(false)
		})
	})

	// ─── active getter ──────────────────────────────────────────────

	describe('active', () => {
		it('returns true when active is true', () => {
			const proxy = new ItemProxy({ text: 'A', active: true })
			expect(proxy.active).toBe(true)
		})

		it('returns false when active is false', () => {
			const proxy = new ItemProxy({ text: 'A', active: false })
			expect(proxy.active).toBe(false)
		})

		it('returns false when active is absent', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.active).toBe(false)
		})
	})

	// ─── itemType getter ────────────────────────────────────────────

	describe('itemType', () => {
		it('returns the type field', () => {
			const proxy = new ItemProxy({ text: 'A', type: 'separator' })
			expect(proxy.itemType).toBe('separator')
		})

		it('defaults to button when no type', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.itemType).toBe('button')
		})
	})

	// ─── Children ───────────────────────────────────────────────────

	describe('children', () => {
		it('hasChildren returns true with non-empty children array', () => {
			const proxy = new ItemProxy({
				text: 'Group',
				children: [{ text: 'Child 1' }, { text: 'Child 2' }]
			})
			expect(proxy.hasChildren).toBe(true)
		})

		it('hasChildren returns false with empty children array', () => {
			const proxy = new ItemProxy({ text: 'Group', children: [] })
			expect(proxy.hasChildren).toBe(false)
		})

		it('hasChildren returns false when children is absent', () => {
			const proxy = new ItemProxy({ text: 'Item' })
			expect(proxy.hasChildren).toBe(false)
		})

		it('returns children array', () => {
			const children = [{ text: 'A' }, { text: 'B' }]
			const proxy = new ItemProxy({ text: 'Group', children })
			expect(proxy.children).toEqual(children)
		})

		it('returns empty array when no children', () => {
			const proxy = new ItemProxy({ text: 'Item' })
			expect(proxy.children).toEqual([])
		})

		it('uses custom children field mapping', () => {
			const proxy = new ItemProxy(
				{ text: 'Group', items: [{ text: 'Sub' }] },
				{ children: 'items' }
			)
			expect(proxy.hasChildren).toBe(true)
			expect(proxy.children).toEqual([{ text: 'Sub' }])
		})

		it('createChildProxy creates proxy with inherited fields', () => {
			const fields: ItemFields = { text: 'name', value: 'id' }
			const parent = new ItemProxy({ name: 'Parent', children: [{ name: 'Child', id: 'c1' }] }, fields)
			const childProxy = parent.createChildProxy(parent.children[0])
			expect(childProxy.text).toBe('Child')
			expect(childProxy.itemValue).toBe('c1')
		})

		it('createChildProxy uses nested fields when specified', () => {
			const fields: ItemFields = {
				text: 'name',
				fields: { text: 'title', value: 'key' }
			}
			const parent = new ItemProxy(
				{ name: 'Parent', children: [{ title: 'Nested', key: 'n1' }] },
				fields
			)
			const childProxy = parent.createChildProxy(parent.children[0])
			expect(childProxy.text).toBe('Nested')
			expect(childProxy.itemValue).toBe('n1')
		})
	})

	// ─── get / has methods ──────────────────────────────────────────

	describe('get and has', () => {
		it('get returns the mapped field value', () => {
			const proxy = new ItemProxy({ text: 'A', icon: 'mdi:home' })
			expect(proxy.get('icon')).toBe('mdi:home')
		})

		it('get returns default value when field is absent', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.get('icon', 'fallback')).toBe('fallback')
		})

		it('get returns null by default when field is absent', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.get('icon')).toBeNull()
		})

		it('has returns true when field exists and is non-null', () => {
			const proxy = new ItemProxy({ text: 'A', icon: 'mdi:home' })
			expect(proxy.has('icon')).toBe(true)
		})

		it('has returns false when field is absent', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.has('icon')).toBe(false)
		})

		it('has returns false when field value is null', () => {
			const proxy = new ItemProxy({ text: 'A', icon: null })
			expect(proxy.has('icon')).toBe(false)
		})

		it('has returns false when field value is undefined', () => {
			const proxy = new ItemProxy({ text: 'A', icon: undefined })
			expect(proxy.has('icon')).toBe(false)
		})

		it('get works with custom field mapping', () => {
			const proxy = new ItemProxy({ glyph: 'star' }, { icon: 'glyph' })
			expect(proxy.get('icon')).toBe('star')
			expect(proxy.has('icon')).toBe(true)
		})
	})

	// ─── snippetName getter ─────────────────────────────────────────

	describe('snippetName', () => {
		it('returns the snippet name', () => {
			const proxy = new ItemProxy({ text: 'A', snippet: 'premium' })
			expect(proxy.snippetName).toBe('premium')
		})

		it('returns null when no snippet', () => {
			const proxy = new ItemProxy({ text: 'A' })
			expect(proxy.snippetName).toBeNull()
		})

		it('returns null for empty string snippet', () => {
			const proxy = new ItemProxy({ text: 'A', snippet: '' })
			expect(proxy.snippetName).toBeNull()
		})
	})

	// ─── createItemProxy factory ────────────────────────────────────

	describe('createItemProxy', () => {
		it('creates an ItemProxy instance', () => {
			const proxy = createItemProxy({ text: 'Test', value: 'test' })
			expect(proxy).toBeInstanceOf(ItemProxy)
			expect(proxy.text).toBe('Test')
		})

		it('passes fields to the proxy', () => {
			const proxy = createItemProxy({ name: 'Test' }, { text: 'name' })
			expect(proxy.text).toBe('Test')
		})

		it('works with string primitives', () => {
			const proxy = createItemProxy('hello')
			expect(proxy.text).toBe('hello')
		})

		it('works with number primitives', () => {
			const proxy = createItemProxy(42)
			expect(proxy.text).toBe('42')
		})
	})
})
