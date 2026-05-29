import { describe, it, expect } from 'vitest'
import {
	resolveTreeFields,
	defaultTreeFields,
	type ResolvedTreeFields
} from '../src/types/tree.js'

describe('resolveTreeFields', () => {
	it('returns the full default mapping when no overrides are passed', () => {
		const resolved = resolveTreeFields()
		expect(resolved).toEqual(defaultTreeFields)
	})

	it('applies the same defaults when called with an empty object', () => {
		const resolved = resolveTreeFields({})
		expect(resolved.expanded).toBe('expanded')
		expect(resolved.level).toBe('level')
		expect(resolved.children).toBe('children')
	})

	it('lets the caller override individual fields without losing the rest', () => {
		const resolved = resolveTreeFields({ expanded: 'isOpen', level: 'depth' })
		expect(resolved.expanded).toBe('isOpen')
		expect(resolved.level).toBe('depth')
		// Untouched defaults survive
		expect(resolved.children).toBe('children')
		expect(resolved.label).toBe('label')
	})

	it('produces a ResolvedTreeFields with every field as a string (no undefineds)', () => {
		const resolved: ResolvedTreeFields = resolveTreeFields({})
		for (const [key, value] of Object.entries(resolved)) {
			expect(typeof value, `expected ${key} to be a string`).toBe('string')
		}
	})
})
